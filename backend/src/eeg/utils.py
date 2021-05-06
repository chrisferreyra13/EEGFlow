
import logging

from django.core.files.base import ContentFile

from rest_framework import status
from rest_framework.response import Response

from .models import FileInfo

from filemanager.storage_manager import get_temporary_upload
from filemanager.models import TemporaryUpload, TemporaryOutput
from filemanager.utils import _get_file_id, _get_user

LOG = logging.getLogger(__name__)
LOAD_RESTORE_PARAM_NAME = 'id'


def make_output_raw_file(request, process_name,raw_output):
    process_result_id = _get_file_id()
    file_id = _get_file_id()
    user=_get_user(request)

    #TODO:VER TEMA BD TEMPORARYOUTPUT

    if user==None:
        user='anon'

    main_path='./cconsciente/processes-temp/'
    filename=user+'_'+process_name+'_'+file_id+'_raw.fif'

    raw_output.save(main_path+filename, overwrite=True)

    return process_result_id


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