
#----IMPORTS----#

import logging

from django.shortcuts import render

from rest_framework import status
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer

from .models import EEGInfo
from .eeg_functions import get_raw
from .serializers import EEGInfoSerializer, DictionaryAdapter

from filemanager.storage_manager import get_stored_upload
from filemanager.models import StoredUpload

####VARIABLES####
LOAD_RESTORE_PARAM_NAME = 'id'
LOG = logging.getLogger(__name__)

####VIEWS####

class EEGInfoView(APIView):
    queryset = EEGInfo.objects.all()
    serializer_class = EEGInfoSerializer

    def get(self, request, format=None):
        #TODO: Esto se va a repetir en otras vistas, podria ser una funcion
        
        if LOAD_RESTORE_PARAM_NAME not in request.GET:
            return Response('A required parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        upload_id = request.GET[LOAD_RESTORE_PARAM_NAME]

        if (not upload_id) or (upload_id == ''):
            return Response('An invalid ID has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            su = get_stored_upload(upload_id)
        except StoredUpload.DoesNotExist as e:
            LOG.error('StoredUpload with ID [%s] not found: [%s]'
                      % (upload_id, str(e)))
            return Response('Not found', status=status.HTTP_404_NOT_FOUND)

        return Response(str(su.upload_id))
        #if no existe, crealo por primera vez
        #upload_id='sample_audvis_filt-0-40_raw.fif'
        upload_id='eeglab_data.set'
        raw=get_raw(upload_id)
        #Dict=DictionaryAdapter(raw.info)
        ch_names=','.join([str(ch_name) for ch_name in raw.info['ch_names']])
        data_eeg_file=dict(nchan=raw.info['nchan'],experimenter=raw.info['experimenter'],meas_date=raw.info['meas_date'],
                            proj_name=raw.info['proj_name'],proj_id=raw.info['proj_id'],
                            ch_names=ch_names,
                            custom_ref_applied=raw.info['custom_ref_applied'])
        
        serializer=EEGInfoSerializer(data_eeg_file)
        #if serializer.is_valid():
        #serializer.create(data_eeg_file)
        return Response(serializer.data)

        #aca tengo q guardar el modelo     

        #Si existe, mostrar modelo (datos principales)

        #upload_id=response.GET[LOAD_RESTORE_PARAM_NAME]
        #serializer=EEGInfoSerializer(Dict)
        
        

