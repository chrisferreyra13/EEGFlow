
#----IMPORTS----#

import logging
import os
from sys import getsizeof

from django.shortcuts import render
from django.http import Http404

from rest_framework import status
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer

from .models import FileInfo
from .eeg_functions import get_raw, get_events
from .serializers import FileInfoSerializer, DictionaryAdapter #, TimeSeriesSerializer

from filemanager.storage_manager import get_stored_upload, get_temporary_upload
from filemanager.models import StoredUpload, TemporaryUpload

import mne

####VARIABLES####
LOAD_RESTORE_PARAM_NAME = 'id'
LOG = logging.getLogger(__name__)

####FUNCTIONS####

def get_upload(upload_id):
    '''if LOAD_RESTORE_PARAM_NAME not in request.GET:
            return Response('A required parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

    upload_id = request.GET[LOAD_RESTORE_PARAM_NAME]
    
    if (not upload_id) or (upload_id == ''):
        return Response('An invalid ID has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)'''

    try:
        tu = get_temporary_upload(upload_id)
    except TemporaryUpload.DoesNotExist as e:
        LOG.error('TemporaryUpload with ID [%s] not found: [%s]'
                    % (upload_id, str(e)))
        raise FileNotFoundError

    return tu


####VIEWS####

class FileInfoView(APIView):

    def getObject(self, pk):
        try:
            return FileInfo.objects.get(pk=pk)
        except FileInfo.DoesNotExist:
            raise Http404
    
    def get(self, request, format=None):

        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('A required parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        file_info=self.getObject(request.query_params[LOAD_RESTORE_PARAM_NAME])

        serializer=FileInfoSerializer(file_info)

        return Response(serializer.data)

    def post(self, request, format=None):
        # Miro que el usuario envie el id que le retornamos al cargar el archivo
        if LOAD_RESTORE_PARAM_NAME not in request.data:
            return Response('A required parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        #parametro para relacionar el modelo FileInfo con el archivo
        upload_id = request.data[LOAD_RESTORE_PARAM_NAME]
        
        if (not upload_id) or (upload_id == ''):
            return Response('An invalid ID has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            tu = get_upload(upload_id)
        except FileNotFoundError:
            Response('Not found', status=status.HTTP_404_NOT_FOUND)

        try:
            raw=get_raw(os.path.join(tu.upload_id,tu.upload_name))
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)

        ch_names=mne.pick_types(raw.info,eeg=True)
        ch_names=','.join([str(ch_name) for ch_name in ch_names])
        eeg={
            'upload_id':upload_id,
            'proj_id':raw.info['proj_id'],
            'proj_name':raw.info['proj_name'],
            'experimenter':raw.info['experimenter'],
            'meas_date':raw.info['meas_date'],
            'nchan':raw.info['nchan'],
            'ch_names':ch_names,
            'custom_ref_applied':raw.info['custom_ref_applied']
            }
        
        
        serializer=FileInfoSerializer(data=eeg)
        if serializer.is_valid():
            serializer.save()
            return Response({'id':serializer.data['id']}, status=status.HTTP_201_CREATED)
        else:
            return Response('Invalid file data.',
            status=status.HTTP_406_NOT_ACCEPTABLE)
        
                
 
class GetTimeSeries(APIView):

    def get(self, request, format=None):
        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('A required parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        #parametro para relacionar el modelo FileInfo con el archivo
        upload_id = request.query_params[LOAD_RESTORE_PARAM_NAME]
        
        if (not upload_id) or (upload_id == ''):
            return Response('An invalid ID has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            tu = get_upload(upload_id)
        except FileNotFoundError:
            Response('Not found', status=status.HTTP_404_NOT_FOUND)

        #Siempre presento la informacion del archivo, guardo en caso de que no este en la BD
        try:
            raw=get_raw(os.path.join(tu.upload_id,tu.upload_name))
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)
        
        ch_names=mne.pick_types(raw.info,eeg=True) # Obtengo numeros, no se si es otra forma de nombrar los canales
        ch_names=[str(ch) for ch in ch_names]
        
        time_series=raw.get_data(picks=['eeg']) # Obtengo todos los canales
        response=Response({
            'signal':time_series,
            'sampling_freq':raw.info['sfreq'],
            'ch_names': ch_names
        })
        return response

class GetEvents(APIView):
    #queryset = EEGInfo.objects.all()
    serializer_class = FileInfoSerializer

    def get(self, request, format=None):
        
        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('A required parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        #parametro para relacionar el modelo FileInfo con el archivo
        upload_id = request.query_params[LOAD_RESTORE_PARAM_NAME]
        
        if (not upload_id) or (upload_id == ''):
            return Response('An invalid ID has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            tu = get_upload(upload_id)
        except FileNotFoundError:
            Response('Not found', status=status.HTTP_404_NOT_FOUND)

        try:
            events=get_events(os.path.join(tu.upload_id,tu.upload_name))
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)
        
        
        response=Response({
            'event_samples':events[:,0],
            'event_id':events[:,2],
            'event_description': ''
        })
        return response
       