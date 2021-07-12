from .eeg_lib import *
from .utils import *
from cconsciente.settings.base import MEDIA_TEMP, MEDIA_STORED, MEDIA_PROC_TEMP_OUTPUT_PATH

LOAD_RESTORE_PARAM_NAME = 'id'

def time_series_step(**kwargs):
    params=kwargs["params"]
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

def result_step(**kwargs):
    return Response({
            'process_status':'SUCCESFULL',
            'result':kwargs["step_type"]
        })

def filter_step(**kwargs):
    input=kwargs["input"]
    params=kwargs["params"]
    step_type=kwargs["step_type"]

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
        if 'l_freq' not in params:
            low_freq=None
        else:
            low_freq=params['l_freq']
            if (not low_freq) or (low_freq == ''):
                low_freq=None
            else:
                try:
                    low_freq=float(low_freq)
                except:
                    return Response('An invalid low cutoff frequency has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

        if 'h_freq' not in params:
            high_freq=None
        else:
            high_freq=params['h_freq']
            if (not high_freq) or (high_freq == ''): 
                high_freq=None
            else:
                try:
                    high_freq=float(high_freq)
                except:
                    return Response('An invalid high cutoff frequency has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)
 
    #SELECT CHANNELS
    #get requested channels
    channels=get_request_channels(params)
    if type(channels)==Response:
        return channels    

    # PROCESS
    if step_type=='NOTCH':
        try:
            output=notch_filter(input,notch_freq,channels)
        except TypeError:
            return Response('Invalid data',
                        status=status.HTTP_406_NOT_ACCEPTABLE)
    
    else:
        if 'type' not in params:
            filter_method='fir'
        else:
            filter_method=params['type']
            if (not filter_method) or (filter_method == ''):    # Por defecto uso fir
                filter_method='fir'
            else:
                if filter_method not in ["fir","iir"]:
                    return Response('An invalid type of filter has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)
        
        if filter_method=='fir':
            fields=["l_trans_bandwidth","h_trans_bandwidth","phase","fir_window","fir_design"] #TODO: Add "pad" param
            # defaults:
            # l_trans_bandwidth: auto = min(max(l_freq * 0.25, 2), l_freq)
            # h_trans_bandwidth: auto = min(max(h_freq * 0.25, 2.), info['sfreq'] / 2. - h_freq)
            defaults=["auto","auto","zero","hamming","firwin"]
            fir_params=check_params(params,params_names=fields,params_values=defaults)
            if fir_params["l_trans_bandwidth"]!='auto':
                fir_params["l_trans_bandwidth"]=float(fir_params["l_trans_bandwidth"])
            if fir_params["h_trans_bandwidth"]!='auto':
                fir_params["h_trans_bandwidth"]=float(fir_params["h_trans_bandwidth"])

            if type(fir_params)==Response: return fir_params
            try:
                output=custom_filter(
                    raw=input,
                    low_freq=low_freq,
                    high_freq=high_freq,
                    channels=channels,
                    filter_method=filter_method,
                    l_trans_bandwidth=fir_params["l_trans_bandwidth"], 
                    h_trans_bandwidth=fir_params["h_trans_bandwidth"],
                    phase=fir_params["phase"],
                    fir_window=fir_params["fir_window"],
                    fir_design=fir_params["fir_design"],
                    )

            except TypeError:
                return Response('Invalid data for FIR filter',
                            status=status.HTTP_406_NOT_ACCEPTABLE)

        else:
            fields=["iir_params"]
            defaults=[None]
            iir_params=check_params(params,params_names=fields,params_values=defaults)
            if type(iir_params)==Response: return iir_params
            try:
                output=custom_filter(
                    raw=input,
                    low_freq=low_freq,
                    high_freq=high_freq,
                    channels=channels,
                    filter_method=filter_method,
                    iir_params=iir_params["iir_params"]
                    )

            except TypeError:
                return Response('Invalid data for IIR filter',
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
    'CUSTOM_FILTER':filter_step
}