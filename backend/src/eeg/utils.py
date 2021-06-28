
import os

from django.core.files.base import ContentFile

from rest_framework import status
from rest_framework.response import Response

from .models import FileInfo
from .eeg_lib import save_raw, psd

from filemanager.storage_manager import get_temporary_upload
from filemanager.models import TemporaryUpload, TemporaryOutput
from filemanager.utils import _get_file_id, _get_user

from cconsciente.settings.base import MEDIA_TEMP, MEDIA_STORED, MEDIA_PROC_TEMP_OUTPUT_PATH


LOAD_RESTORE_PARAM_NAME = 'id'

def get_temp_output_filepath(request,process_result_id=None):
    
    #TODO: check if process_result_id exists in the DB!!! Ahora cabeza

    user=_get_user(request)
    if user==None:
        user='anon'

    filename=user+'_'+process_result_id+'_raw.fif'
    return filename


def make_output_raw_file(request, process_name,raw_output):
    #process_result_id = _get_file_id()
    file_id = _get_file_id()
    
    user=_get_user(request)
    if user==None:
        user='anon'

    #TODO:VER TEMA DB TEMPORARYOUTPUT y retornar process_result_id
    #NOTE:usamos process_name? Si lo usamos, agregar en get_temp_output_filepath
    
    filename=user+'_'+file_id+'_raw.fif'
    filepath=os.path.join(MEDIA_PROC_TEMP_OUTPUT_PATH,filename)
    save_raw(raw_output,filepath, overwrite=True)

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

    filename=user+'.'+process_name+'.'+file_id+'.bin'
    
    try:
        #with open(os.path.join(path,filename), 'wb+') as f:
            #np.save(f, content)
        temp_process_output.file.save(filename,ContentFile(content))
    except:
        raise Response('Error making file for process output', status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    temp_process_output.save()

    return process_result_id

def check_params(request,params_names=None,params_values=None):
    if params_names==None:
        params_names=['save_output','return_output']    # Default params
    if params_values==None:
        params_values=[False]*len(params_names) # Default list

    params=dict(zip(params_names,params_values))
    p=False
    for param_name in params_names:
        if param_name in request.query_params:
            p=request.query_params[param_name]
            
            if p!='' and p!='undefined' and p!=None:
                if type(params[param_name])==int:
                    try:
                        p=int(p)
                        params[param_name]=p
                    except:
                        return Response('An invalid {} field has been provided.'.format(param_name),
                                status=status.HTTP_400_BAD_REQUEST)
                elif type(params[param_name])==str:
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

def get_request_channels(params):
    if 'channels' not in params:
        channels=None
    else:
        channels=params["channels"]
        if type(channels)==str:
            if (not channels) or (channels == ''):    # Si no envian nada, lo aplico en todos los canales
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