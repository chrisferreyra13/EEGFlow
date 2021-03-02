
#----IMPORTS----#

import logging
import os
from sys import getsizeof

from django.shortcuts import render

from rest_framework import status
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer

from .models import EEGInfo
from .eeg_functions import get_raw, get_events
from .serializers import EEGInfoSerializer, DictionaryAdapter, EEGTimeSeriesSerializer

from filemanager.storage_manager import get_stored_upload, get_temporary_upload
from filemanager.models import StoredUpload, TemporaryUpload

####VARIABLES####
LOAD_RESTORE_PARAM_NAME = 'id'
LOG = logging.getLogger(__name__)


####FUNCTIONS####

def getTemporalUpload(request):
    if LOAD_RESTORE_PARAM_NAME not in request.GET:
            return Response('A required parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

    upload_id = request.GET[LOAD_RESTORE_PARAM_NAME]
    
    if (not upload_id) or (upload_id == ''):
        return Response('An invalid ID has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        tu = get_temporary_upload(upload_id)
    except TemporaryUpload.DoesNotExist as e:
        LOG.error('TemporaryUpload with ID [%s] not found: [%s]'
                    % (upload_id, str(e)))
        return Response('Not found', status=status.HTTP_404_NOT_FOUND)
    
    return tu


####VIEWS####

class EEGInfoView(APIView):
    #queryset = EEGInfo.objects.all()
    serializer_class = EEGInfoSerializer

    def get(self, request, format=None):
        tu = getTemporalUpload(request)
        if type(tu).__name__ != 'TemporaryUpload':
            return tu #TODO:No me convence dejarlo asi, mirar en algun momento

        #Siempre presento la informacion del archivo, guardo en caso de que no este en la BD
        try:
            raw=get_raw(os.path.join(tu.upload_id,tu.upload_name))
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)

        ch_names=','.join([str(ch_name) for ch_name in raw.info['ch_names']])
        eeg=EEGInfo(nchan=raw.info['nchan'],experimenter=raw.info['experimenter'],meas_date=raw.info['meas_date'],
                            proj_name=raw.info['proj_name'],proj_id=raw.info['proj_id'],
                            ch_names=ch_names,
                            custom_ref_applied=raw.info['custom_ref_applied'])
            
        try: # TODO: Esto habria q reemplazarlo con is_valid() pero no logro que funcione
                serializer=EEGInfoSerializer(eeg)
        except KeyError:
            return Response('Invalid file data.',
                        status=status.HTTP_406_NOT_ACCEPTABLE)

        #if not EEGInfo.objects.filter().exists():
        #Hay que ver como verificar que la info del eeg ya este en la BD para no guardarlo
        eeg.save()

        return Response(serializer.data)

        

        #aca tengo q guardar el modelo     

 
class EEGTimeSeries(APIView):
    #queryset = EEGInfo.objects.all()
    serializer_class = EEGInfoSerializer

    def get(self, request, format=None):
        tu = getTemporalUpload(request)
        if type(tu).__name__ != 'TemporaryUpload':
            return tu #TODO:No me convence dejarlo asi, mirar en algun momento

        #Siempre presento la informacion del archivo, guardo en caso de que no este en la BD
        try:
            raw=get_raw(os.path.join(tu.upload_id,tu.upload_name))
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)
        
        #print(raw.info['ch_names'])
        #temporalSignal = raw[0, 0:1]
        timeSeries=raw.get_data(picks=['eeg']) #agarro el canal 3, no se cual es
        print(timeSeries.shape)
        response=Response({
            'signal':timeSeries,
            'samplingFreq':raw.info['sfreq'],
        })
        return response

class EEGGetEvents(APIView):
    #queryset = EEGInfo.objects.all()
    serializer_class = EEGInfoSerializer

    def get(self, request, format=None):
        
        tu = getTemporalUpload(request)
        if type(tu).__name__ != 'TemporaryUpload':
            return tu #TODO:No me convence dejarlo asi, mirar en algun momento

        try:
            events=get_events(os.path.join(tu.upload_id,tu.upload_name))
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)
        
        
        response=Response({
            'eventSamples':events[:,0],
            'eventId':events[:,2],
            'eventDescription': ''
        })
        return response
       
        

