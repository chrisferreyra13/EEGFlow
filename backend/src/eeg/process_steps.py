from .eeg_lib import *
from .utils import *
from cconsciente.settings.base import MEDIA_TEMP, MEDIA_STORED, MEDIA_PROC_TEMP_OUTPUT_PATH

LOAD_RESTORE_PARAM_NAME = 'id'

def time_series_step(input=None,params=None,step_type=None):

    if LOAD_RESTORE_PARAM_NAME not in params: # Return if not fileid for processing
            return Response('ID parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

    id=params[LOAD_RESTORE_PARAM_NAME]

    file_info=get_file_info(id) # Get file info from db
    if type(file_info).__name__=='Response':
        return file_info

    try:
        tu = get_upload(file_info.upload_id) # Get file from db
    except FileNotFoundError:
        return Response('Not found', status=status.HTTP_404_NOT_FOUND)

    try:
        filepath=os.path.join(tu.upload_id,tu.upload_name)
        raw=get_raw(MEDIA_TEMP,filepath)
    except TypeError:
        return Response('Invalid file extension',
                    status=status.HTTP_406_NOT_ACCEPTABLE)

    return raw

def result_step(input=None,params=None,step_type=None):
    return Response({
            'process_status':'SUCCESFULL',
            'result':step_type
        })

def filter_step(input=None,params=None,step_type=None):
    
    #SELECT FREQ
    if step_type=='BETA':
        low_freq=13.0
        high_freq=30.0

    elif step_type=='ALPHA':
        low_freq=8.0
        high_freq=13.0

    elif step_type=='THETA':
        low_freq=4.0
        high_freq=8.0

    elif step_type=='DELTA':
        low_freq=0.2
        high_freq=4.0

    elif step_type=='NOTCH':
        if 'notch_freq' not in params:
            notch_freq=50.0   # Frecuencia del filtro notch default
        else:
            notch_freq=params['notch_freq']
    
    elif step_type=='CUSTOM_FILTER':
        if 'low_freq' not in params:
            low_freq=None
        else:
            low_freq=params['low_freq']

        if 'high_freq' not in params:
            high_freq=None
        else:
            high_freq=params['high_freq']
 
    #SELECT CHANNELS
    if 'channels' not in params:
        channels=None
    else:
        channels=params['channels']
        if (not channels) or (channels == ''):    # Si no envian nada, lo aplico en todos los canales
            channels=None
        else:
            try:
                channels=channels.split(',') #Los canales vienen en un string separados por comas
            except:
                return Response('An invalid list of channels has been provided.',
                    status=status.HTTP_400_BAD_REQUEST)   

    # PROCESS
    if step_type=='NOTCH':
        try:
            output=notch_filter(input,notch_freq,channels)
        except TypeError:
            return Response('Invalid data',
                        status=status.HTTP_406_NOT_ACCEPTABLE)
    
    else:
        if 'filter_method' not in params:
            filter_method='fir'
        else:
            filter_method=params['filter_method']
            
        try:
            output=custom_filter(input,low_freq,high_freq,channels,filter_method)

        except TypeError:
            return Response('Invalid data',
                        status=status.HTTP_406_NOT_ACCEPTABLE)


    return output


steps={
    'TIME_SERIES': time_series_step,
    'PLOT_TIME_SERIES':result_step,
    'PLOT_PSD':result_step,
    'PLOT_TIME_FREQUENCY':result_step,
    'BETA':filter_step,
    'ALPHA':filter_step,
    'DELTA':filter_step,
    'THETA':filter_step,
    'NOTCH':filter_step,
}