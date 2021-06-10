import mne
import os
import numpy as np
from django.conf import settings
from cconsciente.settings.base import MEDIA_TEMP, MEDIA_STORED, MEDIA_PROC_TEMP_OUTPUT_PATH


def convert_power_to_db(x):
    '''
    For Power and Energy, use 10*log10(x). For amplitude, use 20*log10(x) ;)
    '''
    return 10*np.log10(x)

def psd(instance, picks=None,type='welch', window='boxcar'): # Instance can be epochs or raw
    tmin=instance.times.min()
    tmax=instance.times.max()
    sfreq=instance.info["sfreq"]
    fmin=0
    fmax=40.0 #sfreqs/2
    
    if type=='welch':
        psds,freqs=mne.time_frequency.psd_welch(
            instance,
            picks=picks,
            n_fft=int(sfreq * (tmax - tmin)),
            n_overlap=0, n_per_seg=None,
            tmin=tmin, tmax=tmax,
            fmin=fmin, fmax=fmax,
            window=window,
            verbose=False
        )
    elif type=='multitaper':
        print('hola')
    
    psds_db=[]
    #psd_db=[]
    for psd in psds:
        psds_db.append(map(convert_power_to_db,psd))

    return psds_db, freqs

def get_raw(media_path,filepath):
    file_extension=filepath.split('.')[1]
    full_filepath=os.path.join(media_path,filepath)
    if file_extension=='set': #EEGLAB
        raw=mne.io.read_raw_eeglab(full_filepath)
    elif file_extension=='fif': #MNE
        raw=mne.io.read_raw_fif(full_filepath)
    else:
        raise TypeError

    return raw

def save_raw(raw,filename, overwrite=True):
    raw.save(filename, overwrite=overwrite)
    return

def get_events(filepath):
    try:
        raw=get_raw(MEDIA_TEMP,filepath)
    except TypeError:
        raise TypeError

    #TODO: Previamente averiguar cual channel tiene
    events = mne.find_events(raw) #, stim_channel='STI 014') Si no pongo un canal especifico, busca en distintos canales
    return events

def notch_filter(raw,notch_freq=50,channels=None):
    
    raw_eeg=raw.copy().pick_types(eeg=True)
    raw_eeg.load_data()

    if channels==None: # Si es None, aplico el filtrado en todos los canales tipo EEG
        channels_idxs=mne.pick_types(raw.info,eeg=True)
    else:
        channels_idxs=mne.pick_channels(raw_eeg.info['ch_names'], include=channels)

    raw_filtered=raw_eeg.notch_filter(freqs=(notch_freq),picks=channels_idxs)

    return raw_filtered


def custom_filter(raw,low_freq=None,high_freq=None,channels=None, filter_method='fir'):

    raw_eeg=raw.copy().pick_types(eeg=True)
    raw_eeg.load_data()

    if channels==None: # Si es None, aplico el filtrado en todos los canales tipo EEG
        channels_idxs=mne.pick_types(raw.info,eeg=True)
    else:
        channels_idxs=mne.pick_channels(raw_eeg.info['ch_names'], include=channels)
    
    raw_filtered=raw_eeg.filter(l_freq=low_freq, h_freq=high_freq, picks=channels_idxs, method=filter_method)

    return raw_filtered

def peak_finder(raw,channels=None,thresh=None):

    raw_eeg=raw.copy().pick_types(eeg=True)

    if channels==None: # Si es None, aplico el filtrado en todos los canales tipo EEG
        channels_idxs=mne.pick_types(raw.info,eeg=True)
    else:
        channels_idxs=mne.pick_channels(raw_eeg.info['ch_names'], include=channels)
    
    series=raw_eeg.get_data(picks=channels_idxs)
    peaks_idx=[]

    for serie in series:
        idx,_=mne.preprocessing.peak_finder(serie, thresh=thresh)
        peaks_idx.append(idx)

    return peaks_idx