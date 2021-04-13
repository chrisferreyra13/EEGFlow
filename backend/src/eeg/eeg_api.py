import mne
import os

from django.conf import settings

MEDIA_TEMP=os.path.join(settings.BASE_DIR, 'media-temp')
MEDIA_STORED=os.path.join(settings.BASE_DIR, 'media-stored')


def get_raw(filepath):
    file_extension=filepath.split('.')[1]
    if file_extension=='set': #EEGLAB
        raw=mne.io.read_raw_eeglab(MEDIA_TEMP+'/'+filepath)
    elif file_extension=='fif': #MNE
        raw=mne.io.read_raw_fif(MEDIA_TEMP+'/'+filepath)
    else:
        raise TypeError

    return raw

def get_events(filepath):
    try:
        raw=get_raw(filepath)
    except TypeError:
        raise TypeError

    #TODO: Previamente averiguar cual channel tiene
    events = mne.find_events(raw) #, stim_channel='STI 014') Si no pongo un canal especifico, busca en distintos canales
    return events

def notch_filter(filepath,notch_freq=50,channels=None):
    try:
        raw=get_raw(filepath)
    except TypeError:
        raise TypeError
    
    if channels==None: # Si es None, aplico el filtrado en todos los canales tipo EEG
        channels=mne.pick_types(raw.info,eeg=True)
    
    
    raw_eeg=raw.copy().pick_types(eeg=True)
    raw_eeg.load_data()
    channels_idxs=mne.pick_channels(raw_eeg.info['ch_names'], include=channels)
    raw_notch=raw_eeg.notch_filter(freqs=(notch_freq),picks=channels_idxs)

    return raw_notch.get_data(picks=channels)


def custom_filter(filepath,low_freq=None,high_freq=None,channels=None, filter_method='fir'):
    try:
        raw=get_raw(filepath)
    except TypeError:
        raise TypeError
    
    if channels==None: # Si es None, aplico el filtrado en todos los canales tipo EEG
        channels=mne.pick_types(raw.info,eeg=True)
    
    
    raw_eeg=raw.copy().pick_types(eeg=True)
    raw_eeg.load_data()
    channels_idxs=mne.pick_channels(raw_eeg.info['ch_names'], include=channels)
    raw_notch=raw_eeg.filter(l_freq=low_freq, h_freq=high_freq, picks=channels_idxs, method=filter_method)

    return raw_notch.get_data(picks=channels)

def peak_finder(filepath,channels=None,thresh=None):
    try:
        raw=get_raw(filepath)
    except TypeError:
        raise TypeError
    
    if channels==None: # Si es None, aplico el filtrado en todos los canales tipo EEG
        channels=mne.pick_types(raw.info,eeg=True)
    
    
    raw_eeg=raw.copy().pick_types(eeg=True)
    series=raw_eeg.get_data(picks=channels)
    peaks_idx=[]

    for serie in series:
        idx,_=mne.preprocessing.peak_finder(serie, thresh=thresh)
        peaks_idx.append(idx)

    return peaks_idx