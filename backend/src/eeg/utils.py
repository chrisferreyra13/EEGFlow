
from enum import Flag
import os
from os import listdir
from os.path import isfile, join
import pickle
from django.core.files.base import ContentFile
import numpy as np

from rest_framework import status
from rest_framework.response import Response

from .models import FileInfo
from .eeg_lib import save_raw, psd
import mne

from filemanager.storage_manager import get_temporary_upload
from filemanager.models import TemporaryUpload, TemporaryOutput
from filemanager.utils import _get_file_id, _get_user

from eegflow.settings.base import MEDIA_TEMP, MEDIA_STORED, MEDIA_PROC_TEMP_OUTPUT_PATH


LOAD_RESTORE_PARAM_NAME = 'id'

def get_temp_method_result_filename(request,process_result_id=None):
    
    #TODO: check if process_result_id exists in the DB!!! Ahora cabeza

    user=_get_user(request)
    if user==None:
        user='anon'

    filename=user+'-'+process_result_id+'-method.pkl'
    return filename

def get_temp_output_filename(request,process_result_id=None):
    #TODO: check if process_result_id exists in the DB!!! Ahora cabeza
    #TODO: por ahora esta version
    onlyfiles = [f for f in listdir(MEDIA_PROC_TEMP_OUTPUT_PATH) if isfile(join(MEDIA_PROC_TEMP_OUTPUT_PATH, f))]

    props=None
    for filename in onlyfiles:
        props=filename.split('-')
        if props[1]==process_result_id and props[2]!='method.pkl':
            return filename
    
    return None


def make_output_instance_file(request, process_name,instance,output_type='raw'):
    #process_result_id = _get_file_id()
    if output_type!='raw' and output_type!='epochs':
        raise ValueError("output_type must be raw or epochs") 
    
    if output_type=='raw':
        output_type='-raw'
    else:
        output_type='-epo'

    file_id = _get_file_id()
    
    user=_get_user(request)
    if user==None:
        user='anon'

    #TODO:VER TEMA DB TEMPORARYOUTPUT y retornar process_result_id
    #NOTE:usamos process_name? Si lo usamos, agregar en get_temp_output_filepath
    
    filename=user+'-'+file_id+output_type+'.fif'
    filepath=os.path.join(MEDIA_PROC_TEMP_OUTPUT_PATH,filename)
    save_raw(instance,filepath, overwrite=True)

    return file_id


def make_process_result_file(request,process_name,content):
    process_result_id = _get_file_id()
    file_id = _get_file_id()
    user=_get_user(request)

    temp_process_output=TemporaryOutput(
                    process_id=process_result_id,
                    file_type=TemporaryOutput.FILE_DATA,
                    process_type=process_name,
                    created_by=user)

    if user==None:
        user='anon'

    filename=user+'-'+process_name+'-'+file_id+'.bin'
    
    try:
        #with open(os.path.join(path,filename), 'wb+') as f:
            #np.save(f, content)
        temp_process_output.file.save(filename,ContentFile(content))
    except:
        raise Response('Error making file for process output', status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    temp_process_output.save()

    return process_result_id

def make_method_result_file(request,data,process_result_id=None):
    if process_result_id is not None:
        user=_get_user(request)
        if user==None:
            user='anon'

        filename=user+'-'+process_result_id+'-method.pkl'
        filepath=os.path.join(MEDIA_PROC_TEMP_OUTPUT_PATH,filename)
        method_result_file = open(filepath, "wb")
        pickle.dump(data, method_result_file)
        method_result_file.close()

    return process_result_id

def get_method_result_data(media_path,filepath=None):
    if filepath is None:
        raise TypeError

    full_filepath=os.path.join(media_path,filepath)
    method_result_file = open(full_filepath, "rb")
    method_result_data = pickle.load(method_result_file)
    method_result_file.close()

    return method_result_data

def check_params(query_params,params_names=None,params_values=None):
    if params_names==None:
        params_names=['save_output','return_output']    # Default params
    if params_values==None:
        params_values=[False]*len(params_names) # Default list

    params=dict(zip(params_names,params_values))
    p=False
    for param_name in params_names:
        if param_name in query_params:
            p=query_params[param_name]
 
            if p!='' and p!='undefined' and p!=None:
                if type(params[param_name])==int or type(params[param_name])==float or params[param_name]==None:
                    try:
                        if type(params[param_name])==int:
                            p=int(p)
                        elif type(params[param_name])==float:
                            p=float(p)
                        elif len(p.split('.'))==2:
                            p=float(p)
                        elif len(p.split('.'))==1:
                            p=int(p)

                        params[param_name]=p
                    except:
                        return Response('An invalid {} field has been provided.'.format(param_name),
                                status=status.HTTP_400_BAD_REQUEST)

                elif type(params[param_name])==bool and p!='none':
                    if p in ["true", "false"]:
                        params[param_name]= True if p=='true' else False
                    
                    else:
                        return Response('An invalid {} field has been provided.'.format(param_name),
                                status=status.HTTP_400_BAD_REQUEST)


                elif type(params[param_name])==str and p!='none':
                    params[param_name]=p
    
    return params


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
            if p==True:
                params[param_name]=True
            elif p==False:
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
        print('TemporaryUpload with ID [%s] not found: [%s]'
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

def get_request_channels(params, param_key='channels'):
    if param_key not in params:
        channels=None
    else:
        channels=params[param_key]
        if type(channels)==str:
            if channels != 'prev':
                if (not channels) or (channels == '') or (channels == []):    # Si no envian nada, lo aplico en todos los canales
                    channels=None
                else:
                    try:
                        channels=channels.split(',')
                    except:
                        return Response('An invalid list of channels has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)

        elif type(channels)==list:
            if len(channels)==0:
                return Response('An invalid list of channels has been provided.',
                    status=status.HTTP_400_BAD_REQUEST)

    return channels

def get_channels_from_instance(channels,instance):
    if channels==None: # Si es None, agarro todos
        channels_idxs=mne.pick_types(instance.info,eeg=True) #Retorna los indices internos de raw
        eeg_info=mne.pick_info(instance.info, sel=channels_idxs)
        returned_channels=eeg_info["ch_names"]
    else:
        returned_channels=channels
        ch_names=instance.info['ch_names']   # Obtengo los nombres de los canales tipo EEG
        if set(channels).issubset(set(ch_names)):
            channels_idxs=mne.pick_channels(ch_names, include=channels) #Retorna los indices internos de raw
        else:
            return Response('An invalid list of channels has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

    return channels_idxs,returned_channels


def prepare_epochs_summary(epochs,events):
    summary={}
    summary["n_epochs"]=len(epochs.selection)
    summary["sampling_freq"]=epochs.info["sfreq"]

    events_selected=np.array([ events[j] for j in epochs.selection ])

    summary["events_selected"]={
        'event_samples':events_selected[:,0],
        'event_ids':events_selected[:,2],
    }

    return summary
