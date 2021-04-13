
#----IMPORTS----#

import logging
import os
from sys import getsizeof

from django.shortcuts import render
from django.http import Http404
from django.core.files import File
from django.core.files.base import ContentFile


from rest_framework import status
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer

from .models import FileInfo
from .eeg_api import *
from .serializers import FileInfoSerializer

from filemanager.storage_manager import get_stored_upload, get_temporary_upload
from filemanager.models import StoredUpload, TemporaryUpload, TemporaryOutput
from filemanager.utils import _get_file_id, _get_user
from filemanager.filemanager_settings import PROCESS_TMP

import mne
import numpy as np

####VARIABLES####
LOAD_RESTORE_PARAM_NAME = 'id'
LOG = logging.getLogger(__name__)

####FUNCTIONS####

def make_process_file(request,process_name,content):
    process_id = _get_file_id()
    file_id = _get_file_id()
    user=_get_user(request)

    temp_process_output=TemporaryOutput(
                    process_id=process_id,
                    file_type=TemporaryOutput.FILE_DATA,
                    process_type=process_name,
                    created_by=user)

    if user==None:
        user='anon'

    filename=user+'.'+process_name+'.'+file_id+'.bin'
    
    try:
        '''with open(os.path.join(path,filename), 'wb+') as f:
            np.save(f, content)'''
        temp_process_output.file.save(filename,ContentFile(content))
    except:
        raise Response('Error making file for process output', status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                        
    temp_process_output.save()

    return process_id

def check_process_params(request,params_names=None,params_values=None):
    if params_names==None:
        params_names=['save_output','return_output']    # Default params
    if params_values==None:
        params_values=[False]*len(params_names) # Default list

    params=dict(zip(params_names,params_values))
    p=False
    for param_name in params_names:
        if param_name in request.query_params:
            p=request.query_params[param_name]
            if p=='true':
                params[param_name]=True
            elif p=='false':
                params[param_name]=False
            else:
                return Response('An invalid {} field has been provided.'.format(param_name),
                    status=status.HTTP_400_BAD_REQUEST)
    
    return params


def get_upload_id(request):
    # Miro que el usuario envie el id que le retornamos al cargar el archivo
    if LOAD_RESTORE_PARAM_NAME not in request.data:
        return Response('A required parameter is missing.',
                        status=status.HTTP_400_BAD_REQUEST)

    #parametro para relacionar el modelo FileInfo con el archivo

    upload_id = request.data[LOAD_RESTORE_PARAM_NAME]

    if (not upload_id) or (upload_id == ''):
        return Response('An invalid ID has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)
    else:
        return upload_id

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

def get_file_info(id):
    try:
        id=int(id)
    except:
        return Response('An invalid ID has been provided.',
                    status=status.HTTP_400_BAD_REQUEST)

    try:
        file_info=FileInfo.objects.get(id=id)
    except:
        return Response('Not found', status=status.HTTP_404_NOT_FOUND)

    return file_info


####VIEWS####

class FileInfoView(APIView):
    
    def get(self, request, format=None):
        
        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('ID parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        id=request.query_params[LOAD_RESTORE_PARAM_NAME]

        file_info=get_file_info(id)
        if type(file_info).__name__=='Response':     # Esto quiere decir que hubo un error, devuelvo response
            return file_info

           
        serializer=FileInfoSerializer(file_info)

        return Response(serializer.data)

    def post(self, request, format=None):
        upload_id=get_upload_id(request)
        if type(upload_id).__name__=='Response':
            return upload_id

        try:
            tu = get_upload(upload_id)
        except FileNotFoundError:
            return Response('Not found', status=status.HTTP_404_NOT_FOUND)
        
        try:
            raw=get_raw(os.path.join(tu.upload_id,tu.upload_name))
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)

        ch_idxs=mne.pick_types(raw.info,eeg=True) # Obtengo los indices de los canales que son EEG
        
        eeg_info=mne.pick_info(raw.info,sel=ch_idxs)    # Obtengo la info de los canales tipo EEG
        ch_names=eeg_info['ch_names']   # Obtengo los nombres de los canales tipo EEG
        ch_names=','.join([ch_name for ch_name in ch_names])

        eeg={
            'upload_id':upload_id,
            'proj_id':eeg_info['proj_id'],
            'proj_name':eeg_info['proj_name'],
            'experimenter':eeg_info['experimenter'],
            'meas_date':eeg_info['meas_date'],
            'nchan':eeg_info['nchan'],
            'ch_names':ch_names,
            'custom_ref_applied':eeg_info['custom_ref_applied']
            }
        
        serializer=FileInfoSerializer(data=eeg)
        if serializer.is_valid():
            serializer.save()
            eeg=FileInfo.objects.get(upload_id=upload_id)
            return Response({'id':eeg.id},status=status.HTTP_201_CREATED)
        else:
            return Response('Invalid file data.', #TODO: si ya se guardo en la BD, tambien salta a este punto
            status=status.HTTP_406_NOT_ACCEPTABLE)
        
                
 
class GetTimeSeries(APIView):

    def get(self, request, format=None):

        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('ID parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        id=request.query_params[LOAD_RESTORE_PARAM_NAME]

        file_info=get_file_info(id)
        if type(file_info).__name__=='Response':
            return file_info

        try:
            tu = get_upload(file_info.upload_id)
        except FileNotFoundError:
            Response('Not found', status=status.HTTP_404_NOT_FOUND)

        try:
            raw=get_raw(os.path.join(tu.upload_id,tu.upload_name))
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)
        
        ch_idxs=mne.pick_types(raw.info,eeg=True) # Obtengo los indices de los canales que son EEG
        
        eeg_info=mne.pick_info(raw.info,sel=ch_idxs)    # Obtengo la info de los canales tipo EEG
        ch_names=eeg_info['ch_names']   # Obtengo los nombres de los canales tipo EEG
        time_series=raw.get_data(picks=['eeg']) # Obtengo todos los canales tipo EEG
        response=Response({
            'signal':time_series,
            'sampling_freq':raw.info['sfreq'],
            'ch_names': ch_names
        })
        return response

class GetEvents(APIView):

    def get(self, request, format=None):
        
        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('ID parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        id=request.query_params[LOAD_RESTORE_PARAM_NAME]

        file_info=get_file_info(id)
        if type(file_info).__name__=='Response':
            return file_info

        try:
            tu = get_upload(file_info.upload_id)
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
       
class NotchFilterView(APIView):
    
    def get(self, request, format=None):

        # CHECK REQUEST PARAMS    
        if 'channels' not in request.query_params:
            channels=None   # Si no envian nada se lo aplico a todos los canales
        else:
            channels=request.query_params['channels']
            if (channels=='') or (not channels):
                channels=None
            else:
                try:
                    channels=channels.split(',')
                except:
                    return Response('An invalid list of channels has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)
        
        
        if 'notch_freq' not in request.query_params:
            notch_freq=50   # Frecuencia del filtro notch default
        else:
            notch_freq=request.query_params['notch_freq']
            if (notch_freq=='') or (not notch_freq):
                notch_freq=50   # Default
            else:
                try:
                    notch_freq=float(notch_freq)
                except:
                    return Response('An invalid notch filter frequency has been provided.',
                        status=status.HTTP_400_BAD_REQUEST) 

        process_params=check_process_params(request,params_names=['save_output','return_output'])

        save_output=process_params['save_output']
        return_output=process_params['return_output']

        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('ID parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        id=request.query_params[LOAD_RESTORE_PARAM_NAME]

        file_info=get_file_info(id)
        if type(file_info).__name__=='Response':
            return file_info

        try:
            tu = get_upload(file_info.upload_id)
        except FileNotFoundError:
            Response('Not found', status=status.HTTP_404_NOT_FOUND)

        # PROCESS

        try:
            time_series_notch=notch_filter(os.path.join(tu.upload_id,tu.upload_name),notch_freq,channels)
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)
                
        # MAKE OUTPUT

        if save_output==True:
            process_id=make_process_file(request,process_name='notch',content=time_series_notch)
            if type(process_id).__name__=='Response':
                return process_id
        else:
            process_id=''
               

        if channels==None:
            channels='all'

        response=Response({
            'signal':time_series_notch,
            'filter':'notch',
            'freqs':[notch_freq],
            'filtered_channels': channels,
            'process_id':process_id
        })
        return response


class CustomFilterView(APIView):
    
    def get(self, request, format=None):

        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('ID parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        id=request.query_params[LOAD_RESTORE_PARAM_NAME]

        file_info=get_file_info(id)
        if type(file_info).__name__=='Response':
            return file_info

        try:
            tu = get_upload(file_info.upload_id)
        except FileNotFoundError:
            Response('Not found', status=status.HTTP_404_NOT_FOUND)
        
        if 'channels' not in request.query_params:
            channels=None
        else:
            channels=request.query_params['channels']
            if (not channels) or (channels == ''):    # Si no envian nada, lo aplico en todos los canales
                channels=None
            else:
                try:
                    channels=channels.split(',')
                except:
                    return Response('An invalid list of channels has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

        if 'low_freq' not in request.query_params:
            low_freq=None
        else:
            low_freq=request.query_params['low_freq']
            if (low_freq=='') or (not low_freq):
                low_freq=None
            else:     
                try:
                    low_freq=float(low_freq)
                except:
                    return Response('An invalid low cutoff frequency has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

        
        if 'high_freq' not in request.query_params:
            high_freq=None
        else:
            high_freq=request.query_params['high_freq']
            if (high_freq=='') or (not high_freq):
                high_freq=None
            else:
                try:
                    high_freq=float(high_freq)
                except:
                    return Response('An invalid high cutoff frequency has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)    
        

        if 'filter_method' not in request.query_params:
            filter_method='fir'
        else:
            filter_method=request.query_params['filter_method']
            if (not filter_method) or (filter_method == ''):
                filter_method='fir' # Default
            elif filter_method!='fir' and filter_method!='iir':
                return Response('An invalid method has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

        try:
            time_series_filtered=custom_filter(os.path.join(tu.upload_id,tu.upload_name),low_freq,high_freq,channels,filter_method)
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)


        #time_series_notch=raw_notch.get_data(picks=channels) # Obtengo todos los canales

        if channels==None:
            channels='all'

        response=Response({
            'signal':time_series_filtered,
            'filter': filter_method,
            'freqs':[low_freq, high_freq],
            'filtered_channels': channels
        })
        return response


class PeakView(APIView):
    
    def get(self, request, format=None):

        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('ID parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        id=request.query_params[LOAD_RESTORE_PARAM_NAME]

        file_info=get_file_info(id)
        if type(file_info).__name__=='Response':
            return file_info

        try:
            tu = get_upload(file_info.upload_id)
        except FileNotFoundError:
            Response('Not found', status=status.HTTP_404_NOT_FOUND)
        
        if 'channels' not in request.query_params:
            channels=None
        else:
            channels=request.query_params['channels']
            if (not channels) or (channels == ''):    # Si no envian nada, lo aplico en todos los canales
                channels=None
            else:
                try:
                    channels=channels.split(',')
                except:
                    return Response('An invalid list of channels has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

        if 'thresh' not in request.query_params:
            thresh=None # Default
        else:
            thresh=request.query_params['thresh']
            if (thresh=='') or (not thresh):
                thresh=None
            else:     
                try:
                    thresh=float(thresh)
                except:
                    return Response('An invalid thresh has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

        try:
            peaks_idx=peak_finder(os.path.join(tu.upload_id,tu.upload_name),channels,thresh)
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)


        if channels==None:
            channels='all'

        response=Response({
            'peaks_idx': peaks_idx,
            'used_channels': channels,
        })
        return response