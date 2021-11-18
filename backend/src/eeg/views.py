
#----IMPORTS----#

from datetime import time
import os
from django.http.response import HttpResponseBadRequest

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
from .eeg_lib import *
from .serializers import FileInfoSerializer
from .process_steps import epochs, steps

from filemanager.storage_manager import get_stored_upload, get_temporary_upload
from filemanager.models import StoredUpload, TemporaryUpload, TemporaryOutput
from filemanager.utils import _get_file_id, _get_user
from filemanager.filemanager_settings import PROCESS_TMP

from cconsciente.settings.base import MEDIA_TEMP, MEDIA_STORED, MEDIA_PROC_TEMP_OUTPUT_PATH

from .utils import *

import mne

import numpy as np

####VARIABLES####
LOAD_RESTORE_PARAM_NAME = 'id'
# OUTPUT_FORMATS={'PLOT_TIME_SERIES':0,'PLOT_PSD':1,'PLOT_TIME_FREQUENCY':2}
ALLOWED_FORMATS=['TIME_SERIES','PSD'] 
####FUNCTIONS###

####VIEWS####

class RunProcess(APIView):
    def post(self, request, format=None):

        # Check process
        if 'process' not in request.data:   # Return if not process in body request
            return Response('Process is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        process=request.data['process']
        
        if (process=='') or (not process):
            return Response('Process is missing.',
                            status=status.HTTP_400_BAD_REQUEST)


        # Check process
        if 'process_id' not in request.data:   # Return if not process in body request
            return Response('Process ID is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        process_id=request.data['process_id']
        
        if (process=='') or (not process):
            return Response('Process ID is missing.',
                            status=status.HTTP_400_BAD_REQUEST)
        

        input=None
        output=None
        
        num_step=1
        num_of_steps=len(process)
        # Preparing output format...
        process_result_ids={}
        output_type='raw'

        print('[INFO]: Running process...')
        for step in process:
            print('[INFO]: STEP {}/{} | PARAMS:{}'.format(num_step,num_of_steps,step['params']))
            output=steps[step['elementType']](input=input,params=step['params'],step_type=step['elementType'],step_id=step["id"])

            if type(output).__name__=='Response':
                if type(output.data)==str: #Es un error
                    return output

                output.data['process_result_ids']=process_result_ids
                output.data["process_id"]=process_id
                output.data["output_type"]=output_type
                output.data["summary"]={}
                if output_type=='epochs': # input is epochs object (input=output one step before)
                    output.data["summary"]=prepare_epochs_summary(input,events)

                print('[INFO]: RESPONSE: {}'.format(output.data))
                return output
            else:
                if step['save_output']==True:
                    if type(output)==dict:
                        if isinstance(output["instance"],mne.BaseEpochs):output_type='epochs'
                        else: output_type='raw'

                        process_result_id=make_output_instance_file(
                            request,
                            process_name=step['elementType'],
                            instance=output["instance"],
                            output_type=output_type
                            )
                        if "method_result" in output.keys():
                            make_method_result_file(request,data=output["method_result"],process_result_id=process_result_id)
                        
                    else: 
                        if isinstance(output,mne.BaseEpochs):output_type='epochs'
                        else: output_type='raw'

                        process_result_id=make_output_instance_file(
                            request,
                            process_name=step['elementType'],
                            instance=output,
                            output_type=output_type
                            )

                    if type(process_result_id).__name__=='Response':
                        return process_result_id # Hubo un error
                    else:
                        process_result_ids[step["id"]]=process_result_id
                        #process_result_ids.append(process_result_id)

                if type(output)==dict:
                    input=output["instance"]
                    if "events" in output.keys():
                        events=output["events"]
                else:
                    input=output

            num_step+=1


class FileInfoView(APIView):
    
    def get(self, request, format=None):
        
        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('ID parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        id=request.query_params[LOAD_RESTORE_PARAM_NAME]
        print(f'[INFO]: estas buscando con este id: {id}')
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
            filepath=os.path.join(tu.upload_id,tu.upload_name)
            raw=get_raw(MEDIA_TEMP,filepath)
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)

        ch_idxs=mne.pick_types(raw.info,eeg=True) # Obtengo los indices de los canales que son EEG
        
        eeg_info=mne.pick_info(raw.info,sel=ch_idxs)    # Obtengo la info de los canales tipo EEG
        ch_names=eeg_info['ch_names']   # Obtengo los nombres de los canales tipo EEG
        ch_names=','.join([ch_name for ch_name in ch_names])
        if eeg_info['proj_id']!=None and type(eeg_info['proj_id'])!=str:
            proj_id=','.join([str(id) for id in eeg_info['proj_id']])
        else:
            proj_id=eeg_info['proj_id']

        eeg={
            'upload_id':upload_id,
            'proj_id':proj_id,
            'proj_name':eeg_info['proj_name'],
            'experimenter':eeg_info['experimenter'],
            'meas_date':eeg_info['meas_date'],
            'nchan':eeg_info['nchan'],
            'ch_names':ch_names,
            'custom_ref_applied':int(eeg_info['custom_ref_applied']),
            }
        
        serializer=FileInfoSerializer(data=eeg)
        if serializer.is_valid():
            serializer.save()
            eeg=FileInfo.objects.get(upload_id=upload_id)
            return Response({'id':str(eeg.id)},status=status.HTTP_201_CREATED)
        else:
            return Response('Invalid file data.', #TODO: si ya se guardo en la BD, tambien salta a este punto
            status=status.HTTP_406_NOT_ACCEPTABLE)
                 
class GetTimeSeries(APIView):

    def get(self, request, format=None):

        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('ID parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        id=request.query_params[LOAD_RESTORE_PARAM_NAME]

        # Check if is a number or an id result and get the filepath
        media_path=MEDIA_TEMP
        if id.isnumeric():
            file_info=get_file_info(id)
            if type(file_info).__name__=='Response':
                return file_info

            try:
                tu = get_upload(file_info.upload_id)
            except FileNotFoundError:
                Response('Not found', status=status.HTTP_404_NOT_FOUND)

            filepath=os.path.join(tu.upload_id,tu.upload_name)
            media_path=MEDIA_TEMP

        else:
            filepath=get_temp_output_filename(request,process_result_id=id)
            media_path=MEDIA_PROC_TEMP_OUTPUT_PATH

        if filepath==None:
            return Response('Invalid ID',
                            status=status.HTTP_406_NOT_ACCEPTABLE)

        # Get the instance
        if filepath.split('-')[-1]=='epo.fif':
            try:
                instance=get_epochs(media_path,filepath)
            except TypeError:
                return Response('Invalid file extension',
                            status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            try:
                instance=get_raw(media_path,filepath)
            except TypeError:
                return Response('Invalid file extension',
                            status=status.HTTP_406_NOT_ACCEPTABLE)
        
        #get requested channels
        channels=get_request_channels(request.query_params)
        if type(channels)==Response:
            return channels

        if channels==None or channels=='prev': # Si es None, agarro todos
            channels_idxs=mne.pick_types(instance.info,eeg=True) #Retorna los indices internos del instance
            
            if channels=='prev': # select just two channels for preview purposes
                if len(channels_idxs)>=2:
                    channels_idxs=channels_idxs[:2]
                else: channels_idxs=channels_idxs[0]

            eeg_info=mne.pick_info(instance.info, sel=channels_idxs)
            returned_channels=eeg_info["ch_names"]
            
        else:
            returned_channels=channels
            ch_names=instance.info['ch_names']   # Obtengo los nombres de los canales tipo EEG
            if set(channels).issubset(set(ch_names)):
                channels_idxs=mne.pick_channels(ch_names, include=channels,ordered=True) #Retorna los indices internos del instance
            else:
                return Response('An invalid list of channels has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)

        if 'epochs' not in request.query_params:
            epochs=None
        else:
            epochs=request.query_params["epochs"]
            if type(epochs)==str:
                if (not epochs) or (epochs == ''):    # Si no envian nada, lo aplico en todos los canales
                    epochs=None
                else:
                    try:
                        epochs=int(epochs)
                    except:
                        return Response('An invalid epoch has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)

            elif type(epochs)==list:
                if len(epochs)==0:
                    return Response('An invalid list of epochs has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)
                else:
                    try:
                        epochs=[int(epo) for epo in epochs]
                    except:
                        return Response('An invalid epoch has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)
        

        data=instance.get_data(picks=channels_idxs) # Take the requested channels

        times=None
        if len(np.shape(data))==2 and epochs is None: # raw object
            time_series=data 
        else:
            n_epochs,n_channels,n_times=np.shape(data) #get the shape of the object
            time_series=[]
            times=instance.times
            if type(epochs)==list: #por ahora no vamos a usar este, pero lo dejo
                for j in range(epochs):
                    time_series.append(data[j])
            
            else:
                epoch_idx=epochs-1 #correction: label -> index
                time_series=data[epoch_idx]

            

        response=Response({
            'signal':time_series,
            'times':times,
            'sampling_freq':instance.info['sfreq'],
            'ch_names': returned_channels,
            })

        
        return response

class GetTimeFrequency(APIView):
    def get(self, request, format=None):
        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('ID parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        id=request.query_params[LOAD_RESTORE_PARAM_NAME]
        
        # Check if is a number or an id result and get the filepath
        media_path=MEDIA_TEMP
        if id.isnumeric():
            file_info=get_file_info(id)
            if type(file_info).__name__=='Response':
                return file_info

            try:
                tu = get_upload(file_info.upload_id)
            except FileNotFoundError:
                Response('Not found', status=status.HTTP_404_NOT_FOUND)

            filepath=os.path.join(tu.upload_id,tu.upload_name)
            media_path=MEDIA_TEMP

        else:
            filepath=get_temp_output_filename(request,process_result_id=id)
            media_path=MEDIA_PROC_TEMP_OUTPUT_PATH

        if filepath==None:
            return Response('Invalid ID',
                            status=status.HTTP_406_NOT_ACCEPTABLE)

        # Get the instance
        if filepath.split('-')[-1]=='epo.fif':
            try:
                instance=get_epochs(media_path,filepath)
            except TypeError:
                return Response('Invalid file extension',
                            status=status.HTTP_406_NOT_ACCEPTABLE)

        else: # We apply tf just for epoch object
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)
        
        #get requested channels
        channels=get_request_channels(request.query_params)
        if type(channels)==Response:
            return channels

        if channels==None or channels=='prev': # Si es None, agarro todos
            channels_idxs=mne.pick_types(instance.info,eeg=True) #Retorna los indices internos del instance
            
            if channels=='prev': # select just two channels for preview purposes
                if len(channels_idxs)>=2:
                    channels_idxs=channels_idxs[:2]
                else: channels_idxs=channels_idxs[0]

            eeg_info=mne.pick_info(instance.info, sel=channels_idxs)
            returned_channels=eeg_info["ch_names"]
            
        else:
            returned_channels=channels
            ch_names=instance.info['ch_names']   # Obtengo los nombres de los canales tipo EEG
            if set(channels).issubset(set(ch_names)):
                channels_idxs=mne.pick_channels(ch_names, include=channels,ordered=True) #Retorna los indices internos del instance
            else:
                return Response('An invalid list of channels has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)

        if 'epochs' not in request.query_params:
            epochs=None
        else:
            epochs=request.query_params["epochs"]
            if type(epochs)==str:
                if (not epochs) or (epochs == ''):    # Si no envian nada, lo aplico en todos los canales
                    epochs=None
                else:
                    try:
                        epochs=int(epochs)
                    except:
                        return Response('An invalid epoch has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)

            elif type(epochs)==list:
                if len(epochs)==0:
                    return Response('An invalid list of epochs has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)
                else:
                    try:
                        epochs=[int(epo) for epo in epochs]
                    except:
                        return Response('An invalid epoch has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)

        #get type of tf
        if 'type' not in request.query_params:
            type_of_tf='morlet'
        else:
            type_of_tf=request.query_params['type']
            if (not type_of_tf) or (type_of_tf == ''):    # Por defecto uso welch
                type_of_tf='morlet'
            else:
                if type_of_tf not in ["morlet","multitaper","stockwell"]:
                    return Response('An invalid type of time-frequency method has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

        
        # get if average result for morlet o multitaper (stockwell always average result)
        if 'average' not in request.query_params:
            average=False
        else:
            average=request.query_params["average"]
            if (not average) or (average == ''):    # Si no envian nada, lo aplico en todos los canales
                average=False
            else:
                if average in ["true","false"]:
                    average=True if average=='true' else False
                else:
                    return Response('An invalid average value has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

        # get min and max value of tf heatmap
        if 'vrange' not in request.query_params:
            vmin, vmax = None,None  # Define our color limits.
        else:
            vrange=request.query_params['vrange']
            if (not vrange) or (vrange == []) or (vrange == '') or (vrange == ','):
                vmin, vmax=None,None
            else:
                try:
                    vmin, vmax=[float(f) for f in vrange.split(',')]
                except:
                    return Response('An invalid heatmap value range has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)
                
                if vmin>vmax:
                    return Response('An invalid heatmap value range has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

        # get baseline correction
        if 'baseline' not in request.query_params:
            baseline = None
        else:
            baseline=request.query_params['baseline']
            if (not baseline) or (baseline == []) or (baseline == ''):
                baseline = None
            else:
                if baseline == ',':
                    baseline=(None, None) # Apply baseline correction to full time range
                else:
                    try:
                        baseline=tuple([float(f) for f in baseline.split(',')])
                    except:
                        return Response('An invalid baseline correction range has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)
                
                    if baseline[0]>baseline[1]:
                        return Response('An invalid baseline correction range has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)
        
        # get baseline correction mode: ‘mean’ | ‘ratio’ | ‘logratio’ | ‘percent’ | ‘zscore’ | ‘zlogratio’
        if 'mode' not in request.query_params:
            mode = 'mean'
        else:
            mode=request.query_params['mode']
            if (not mode) or (mode == ''):
                mode = 'mean'
            else:
                if mode not in ["mean","ratio","logratio","percent","zscore","zlogratio"]:
                    return Response('An invalid baseline correction mode has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

        # get if return result in dB
        if 'dB' not in request.query_params:
            dB=False
        else:
            dB=request.query_params["dB"]
            if (not dB) or (dB == ''):    # Si no envian nada, lo aplico en todos los canales
                dB=False
            else:
                if dB in ["true","false"]:
                    dB=True if dB=='true' else False
                else:
                    return Response('An invalid dB value has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

        # get freqs of tf
        if 'freqs' not in request.query_params:
            # * start, end, step
            freqs=(5., 70., 3.) # ? por ahora pruebo esto
        else:
            freqs=request.query_params['freqs']
            if (not freqs) or (freqs == []) or (freqs == ''):
                freqs=(5., 70., 3.)
            else:
                try:
                    freqs=tuple([float(f) for f in freqs.split(',')]) # "start,end,step" string
                except:
                    return Response('An invalid frequency range has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)
                
                if freqs[0]>freqs[1]:
                    return Response('An invalid frequency range has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

        freqs=np.arange(freqs[0],freqs[1],freqs[2])

        #TODO: ver como hacer para poner un n_cycles por defecto sin q explote
        if 'n_cycles' not in request.query_params:
            n_cycles=freqs/5.0
        else:
            n_cycles=request.query_params["n_cycles"]
            if (not n_cycles) or (n_cycles == ''):    # Si no envian nada, lo aplico en todos los canales
                n_cycles=freqs/5.0
            else:
                if len(n_cycles.split(','))==2:
                    try:
                        n_cycles=freqs/float(n_cycles.split(',')[1])
                    except:
                        return Response('An invalid number of cycles has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)
                else:
                    try:
                        n_cycles=float(n_cycles)
                    except:
                        return Response('An invalid number of cycles has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)      


        # check params for different types of tf
        if type_of_tf=='morlet':
            fields=["use_fft","zero_mean"]
            defaults=[False,True]
            params=check_params(request.query_params,params_names=fields,params_values=defaults)
            if type(params)==Response: return params

            params["freqs"]=freqs
            params["n_cycles"]=n_cycles
            
        elif type_of_tf=='multitaper':
            fields=["time_bandwidth","use_fft"]
            defaults=[4.0,True]
            params=check_params(request.query_params,params_names=fields,params_values=defaults)
            if type(params)==Response: return params

            params["freqs"]=freqs
            params["n_cycles"]=n_cycles
        
        else: # stockwell
            fields=["fmin","fmax", "n_fft","width"]
            defaults=[None,None,None,1.0]
            params=check_params(request.query_params,params_names=fields,params_values=defaults)
            if type(params)==Response: return params


        return_itc=False
        data=time_frequency(
                    instance=instance,
                    picks=channels_idxs,
                    type_of_tf=type_of_tf,
                    average=average,
                    return_itc=return_itc,
                    **params
                    )

        if return_itc:
            tfr,itc=data
        else:
            tfr=data
        

        tmin,tmax=(None,None) # lo usamos por defecto por ahora -> todo el rango para viz
        fmin,fmax=(None,None) 
        tfr = mne.time_frequency.tfr._preproc_tfr_instance(
            tfr, None, tmin, tmax, fmin, fmax, vmin, vmax, dB, mode,
            baseline, exclude=None, copy=True)

        tmin, tmax = tfr.times[[0, -1]]
        if vmax is None:
            vmax = np.abs(tfr.data).max()
        if vmin is None:
            vmin = -np.abs(tfr.data).max()

        power=[]
        if average:
            power=tfr.data
        else:
            if type(epochs)==list: #por ahora no vamos a usar este, pero lo dejo
                for j in range(epochs):
                    power.append(tfr.data[j])
            
            else:
                epoch_idx=epochs-1 #correction: label -> index
                power=tfr.data[epoch_idx]

        response=Response({
            'signal':power,
            'utils':{
                'times':tfr.times,
                'freqs':tfr.freqs,
                'vmin':vmin,
                'vmax':vmax,
            },
            'sampling_freq':instance.info['sfreq'],
            'ch_names': returned_channels,
            })
        
        return response

class GetPSD(APIView):
    def get(self, request, format=None):

        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('ID parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)
        
        id=request.query_params[LOAD_RESTORE_PARAM_NAME]

        # Check if is a number or an id result and get the filepath
        media_path=MEDIA_TEMP
        if id.isnumeric():
            file_info=get_file_info(id)
            if type(file_info).__name__=='Response':
                return file_info

            try:
                tu = get_upload(file_info.upload_id)
            except FileNotFoundError:
                Response('Not found', status=status.HTTP_404_NOT_FOUND)

            filepath=os.path.join(tu.upload_id,tu.upload_name)
            media_path=MEDIA_TEMP

        else:
            filepath=get_temp_output_filename(request,process_result_id=id)
            media_path=MEDIA_PROC_TEMP_OUTPUT_PATH

        if filepath==None:
            return Response('Invalid ID',
                            status=status.HTTP_406_NOT_ACCEPTABLE)

        # Get the instance
        if filepath.split('-')[-1]=='epo.fif':
            try:
                instance=get_epochs(media_path,filepath)
            except TypeError:
                return Response('Invalid file extension',
                            status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            try:
                instance=get_raw(media_path,filepath)
            except TypeError:
                return Response('Invalid file extension',
                            status=status.HTTP_406_NOT_ACCEPTABLE)
        
        #get requested channels
        channels=get_request_channels(request.query_params)
        if type(channels)==Response:
            return channels 

        if channels==None or channels=='prev': # Si es None, agarro todos
            channels_idxs=mne.pick_types(instance.info,eeg=True) #Retorna los indices internos del instance
            
            if channels=='prev': # select just two channels for preview purposes
                if len(channels_idxs)>=2:
                    channels_idxs=channels_idxs[:2]
                else: channels_idxs=channels_idxs[0]

            eeg_info=mne.pick_info(instance.info, sel=channels_idxs)
            returned_channels=eeg_info["ch_names"]
            
        else:
            returned_channels=channels
            ch_names=instance.info['ch_names']   # Obtengo los nombres de los canales tipo EEG
            if set(channels).issubset(set(ch_names)):
                channels_idxs=mne.pick_channels(ch_names, include=channels,ordered=True) #Retorna los indices internos de raw
            else:
                return Response('An invalid list of channels has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)

        if 'epochs' not in request.query_params:
            epochs=None
        else:
            epochs=request.query_params["epochs"]
            if type(epochs)==str:
                if (not epochs) or (epochs == ''):    # Si no envian nada, lo aplico en todos los canales
                    epochs=None
                else:
                    try:
                        epochs=int(epochs)
                    except:
                        return Response('An invalid epoch has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)

            elif type(epochs)==list:
                if len(epochs)==0:
                    return Response('An invalid list of epochs has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)
                else:
                    try:
                        epochs=[int(epo) for epo in epochs]
                    except:
                        return Response('An invalid epoch has been provided.',
                            status=status.HTTP_400_BAD_REQUEST)
        
        #get type of psd
        if 'type' not in request.query_params:
            type_of_psd='welch'
        else:
            type_of_psd=request.query_params['type']
            if (not type_of_psd) or (type_of_psd == ''):    # Por defecto uso welch
                type_of_psd='welch'
            else:
                if type_of_psd not in ["welch","multitaper"]:
                    return Response('An invalid type of psd has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)

        
        #get time and freq window
        if 'time_window' not in request.query_params:
            time_window=[None,None]#[instance.times.min(),instance.times.max()]
        else:
            time_window=request.query_params['time_window']
            if (not time_window) or (time_window == []) or (time_window == ','):    # Por defecto uso toda la duracion de la señal
                time_window=[None,None]#[instance.times.min(),instance.times.max()]
            else:
                try:
                    time_window=[float(t) for t in time_window.split(',')]
                except:
                    return Response('An invalid time window has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)
                
                if epochs is not None:
                    time_window=[None,None]

                elif time_window[0]>time_window[1]:
                    return Response('An invalid time window has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)
                

        if 'freq_window' not in request.query_params:
            freq_window=[0,instance.info["sfreq"]/2] #Mas o menos todo el rango de frecuencias
        else:
            freq_window=request.query_params['freq_window']
            if (not freq_window) or (freq_window == []) or (freq_window == ''):    # Por defecto todo el rango de frecuencias
                freq_window=[0,instance.info["sfreq"]/2]
            else:
                try:
                    freq_window=[float(f) for f in freq_window.split(',')]
                except:
                    return Response('An invalid frequency window has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)
                
                if freq_window[0]>freq_window[1]:
                    return Response('An invalid frequency window has been provided.',
                        status=status.HTTP_400_BAD_REQUEST)
        

        if type_of_psd=='welch':
            fields=["n_fft","n_overlap","n_per_seg","window","average"]
            defaults=[0,None,'boxcar','mean']
            if time_window[0] is None or time_window[1] is None:
                xmin=0
                xmax=0
                diff=0
                if isinstance(instance,mne.BaseEpochs):
                    xmin=instance.times[0]
                    xmax=instance.times[-1]
                    diff=int(instance.info["sfreq"]*(xmax-xmin))
                else:
                    xmin=instance.first_samp
                    xmax=instance.last_samp
                    diff=int(xmax-xmin)

                defaults.insert(0,diff)
            else:
                defaults.insert(0,int(instance.info["sfreq"]*(time_window[1]-time_window[0])))

            welch_params=check_params(request.query_params,params_names=fields,params_values=defaults)
            if type(welch_params)==Response: return welch_params

            data,freqs=psd(
                instance=instance,
                freq_window=freq_window,time_window=time_window,
                picks=channels_idxs,
                type_of_psd=type_of_psd,
                n_fft=welch_params["n_fft"],
                n_overlap=welch_params["n_overlap"],
                n_per_seg=None,#welch_params["n_per_seg"],
                window=welch_params["window"],
                average=welch_params["average"],
            ) 
        elif type_of_psd=='multitaper':
            fields=["bandwidth","adaptive","low_bias","normalization"]
            defaults=[4,False,False,'length']
            multitaper_params=check_params(request.query_params,params_names=fields,params_values=defaults)
            if type(multitaper_params)==Response: return multitaper_params

            data,freqs=psd(
                instance=instance,
                freq_window=freq_window,time_window=time_window,
                picks=channels_idxs,
                type_of_psd=type_of_psd,
                bandwidth=multitaper_params["bandwidth"],
                adaptive=multitaper_params["adaptive"],
                low_bias=multitaper_params["low_bias"],
                normalization=multitaper_params["normalization"],
            )
        
        if len(np.shape(data))==1 and epochs is None: # raw object
            psds=data 
        else:
            psds=[]
            if type(epochs)==list: #por ahora no vamos a usar este, pero lo dejo
                for j in range(epochs):
                    psds.append(data[j])
            
            else:
                epoch_idx=epochs-1 #correction: label -> index
                psds=data[epoch_idx]    
        
        response=Response({
            'signal':psds,
            'utils':{
                'freqs':freqs,
            },
            'sampling_freq':instance.info['sfreq'],
            'ch_names': returned_channels,
            })
        
        return response

class GetEvents(APIView):

    def get(self, request, format=None):
        
        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('ID parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        id=request.query_params[LOAD_RESTORE_PARAM_NAME]

        # Check if is a number or an id result and get the filepath
        media_path=MEDIA_TEMP
        if id.isnumeric():
            file_info=get_file_info(id)
            if type(file_info).__name__=='Response':
                return file_info

            try:
                tu = get_upload(file_info.upload_id)
            except FileNotFoundError:
                Response('Not found', status=status.HTTP_404_NOT_FOUND)

            filepath=os.path.join(tu.upload_id,tu.upload_name)
            media_path=MEDIA_TEMP

        else:
            filepath=get_temp_output_filename(request,process_result_id=id)
            media_path=MEDIA_PROC_TEMP_OUTPUT_PATH

        # Get the raw
        try:
            raw=get_raw(media_path,filepath)
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)

        # Get events
        try:
            events=get_events(raw)
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)
        
        # if type(events)==tuple:
        #     events=events[0]
        
        response=Response({
            'data':{
                'event_samples':events[:,0],
                'event_ids':events[:,2],
                'event_descriptions': '',
                'sampling_freq':raw.info['sfreq'],
                'first_sample':raw.first_samp,
                'last_sample':raw.last_samp
            },
            'ch_names':[]
        })
        return response
       
class NotchFilterView(APIView):
    
    def get(self, request, format=None):

        # CHECK REQUEST PARAMS    
        #get requested channels
        channels=get_request_channels(request.query_params)
        if type(channels)==Response:
            return channels  
        
        
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
            filepath=os.path.join(tu.upload_id,tu.upload_name)
            raw=get_raw(MEDIA_TEMP,filepath)
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)
        try:
            raw_filtered=notch_filter(raw,notch_freq,channels)
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)

        if channels==None: # Si es None, aplico el filtrado en todos los canales tipo EEG
            pick_channels=mne.pick_types(raw.info,eeg=True)

        time_series_filtered=raw_filtered.get_data(picks=pick_channels)
                
        # MAKE OUTPUT

        if save_output:
            process_id=make_process_result_file(request,process_name='notch',content=time_series_filtered)
            if type(process_id).__name__=='Response':
                return process_id
        else:
            process_id=''

        output_dict={
                'signal':'',
                'filter':'notch',
                'freqs':[notch_freq],
                'filtered_channels': channels,
                'process_id':process_id
            }

        if return_output:
            output_dict['signal']=time_series_filtered,
                

        if channels==None:
            channels='all'

        response=Response(output_dict)
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
        
        #get requested channels
        channels=get_request_channels(request.query_params)
        if type(channels)==Response:
            return channels  

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

        #PROCESS
        try:
            filepath=os.path.join(tu.upload_id,tu.upload_name)
            raw=get_raw(MEDIA_TEMP,filepath)
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)
        try:
            raw_filtered=custom_filter(raw,low_freq,high_freq,channels,filter_method)
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)

        if channels==None: # Si es None, aplico el filtrado en todos los canales tipo EEG
            pick_channels=mne.pick_types(raw.info,eeg=True)

        time_series_filtered=raw_filtered.get_data(picks=pick_channels)
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


class GetPeaks(APIView):
    
    def get(self, request, format=None):

        if LOAD_RESTORE_PARAM_NAME not in request.query_params:
            return Response('ID parameter is missing.',
                            status=status.HTTP_400_BAD_REQUEST)

        id=request.query_params[LOAD_RESTORE_PARAM_NAME]

        filepath=get_temp_method_result_filename(request,process_result_id=id)
        media_path=MEDIA_PROC_TEMP_OUTPUT_PATH

        # Get the method result
        try:
            method_result=get_method_result_data(media_path,filepath)
        except TypeError:
            return Response('Invalid file extension',
                        status=status.HTTP_406_NOT_ACCEPTABLE)
        
        #get requested channels
        channels=get_request_channels(request.query_params)
        if type(channels)==Response:
            return channels

        response=Response({
            "data":method_result,
            "ch_names":channels
            })

        
        return response
