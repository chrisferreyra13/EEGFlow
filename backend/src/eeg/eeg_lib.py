import re
import mne
import os
import numpy as np
from django.conf import settings
from cconsciente.settings.base import MEDIA_TEMP, MEDIA_STORED, MEDIA_PROC_TEMP_OUTPUT_PATH


def convert_power_to_db(x):
    '''
    For Power and Energy, use 10*log10(x). For amplitude, use 20*log10(x) ;)
    '''
    return 10*np.log10(np.maximum(x, np.finfo(float).tiny))


# Instance must be epochs or evoked
def time_frequency(instance, picks=None, type_of_tf='morlet', return_itc=True, **kwargs):
    average = kwargs["average"]
    freqs = np.logspace(*np.log10([6, 35]), num=8)
    n_cycles = freqs / 2.  # different number of cycle per frequency
    time_bandwidth = 4.0  # Same frequency-smoothing as (1) 3 tapers.

    if type_of_tf == 'morlet':
        power = mne.time_frequency.tfr_morlet(
            instance,
            picks=picks,
            freqs=freqs,
            n_cycles=n_cycles,
            use_fft=True,
            return_itc=return_itc,
            decim=3,
            n_jobs=1,
            average=average,
        )
    elif type_of_tf == 'multitaper':
        power = mne.time_frequency.tfr_multitaper(
            instance,
            picks=picks,
            freqs=freqs,
            n_cycles=n_cycles,
            time_bandwidth=time_bandwidth,
            use_fft=True,
            return_itc=return_itc,
            decim=3,
            n_jobs=1,
            average=average,
        )

    elif type_of_tf == 'stockwell':
        print('hola')

    if return_itc:
        return power, itc
    else:
        return power


# Instance can be epochs or raw
def psd(instance, freq_window, time_window=[None, None], picks=None, type_of_psd='welch', **kwargs):

    if type_of_psd == 'welch':
        psds, freqs = mne.time_frequency.psd_welch(
            inst=instance,
            tmin=time_window[0], tmax=time_window[1],
            fmin=freq_window[0], fmax=freq_window[1],
            picks=picks,
            n_fft=kwargs["n_fft"],
            n_overlap=kwargs["n_overlap"],
            n_per_seg=kwargs["n_per_seg"],
            average=kwargs["average"],
            window=kwargs["window"],
            verbose=False
        )

    elif type_of_psd == 'multitaper':
        psds, freqs = mne.time_frequency.psd_multitaper(
            inst=instance,
            tmin=time_window[0], tmax=time_window[1],
            fmin=freq_window[0], fmax=freq_window[1],
            picks=picks,
            bandwidth=kwargs["bandwidth"],
            adaptive=kwargs["adaptive"],
            low_bias=kwargs["low_bias"],
            normalization=kwargs["normalization"],
            verbose=False
        )

    # [psds]=amp**2/Hz

    psds_db = []
    # psd_db=[]
    for psd in psds:
        psds_db.append(map(convert_power_to_db, psd))

    return psds_db, freqs


def get_epochs(media_path, filepath):
    full_filepath = os.path.join(media_path, filepath)
    epochs = mne.read_epochs(full_filepath)

    return epochs


def get_raw(media_path, filepath):
    file_extension = filepath.split('.')[1]
    full_filepath = os.path.join(media_path, filepath)
    if file_extension == 'set':  # EEGLAB
        raw = mne.io.read_raw_eeglab(full_filepath)
    elif file_extension == 'fif':  # MNE
        raw = mne.io.read_raw_fif(full_filepath)
    elif file_extension == 'edf':  # European Data Format
        raw = mne.io.read_raw_edf(full_filepath)
    else:
        raise TypeError

    return raw


def save_raw(instance, filename, overwrite=True):
    instance.save(filename, overwrite=overwrite)
    return


def add_events(instance, new_events):
    if new_events is None:
        return instance

    instance_eeg_stim = instance.copy().pick_types(eeg=True, stim=True)
    instance_eeg_stim.load_data()
    instance_eeg_stim.add_events(new_events)  # , stim_channel='STI 014')
    return instance_eeg_stim


def get_events(raw):
    # TODO: Previamente averiguar cual channel tiene
    try:
        # , stim_channel='STI 014') Si no pongo un canal especifico, busca en distintos canales
        events = mne.find_events(raw)
    except ValueError:
        print("[INFO] the file doesn't have events... trying with annotations...")
        try:
            events, events_dict = mne.events_from_annotations(raw)
        except Exception as ex:
            print("[INFO] the file doesn't have events")
            raise ex

    return events


def notch_filter(instance, notch_freqs=[50.0], channels=None, filter_method='fir', **kwargs):
    
    if isinstance(instance,mne.BaseEpochs):
        instance.load_data()
        instance_eeg = instance.copy().pick_types(eeg=True)
    else:
        instance_eeg = instance.copy().pick_types(eeg=True)
        instance_eeg.load_data()

    if channels == None:  # Si es None, aplico el filtrado en todos los canales tipo EEG
        channels_idxs = mne.pick_types(instance.info, eeg=True)
    else:
        channels_idxs = mne.pick_channels(
            instance_eeg.info['ch_names'], include=channels)

    if filter_method == 'spectrum_fit':
        instance_eeg.apply_function(
            fun=mne.filter.notch_filter,
            picks=channels_idxs,
            dtype=None,
            n_jobs=1,
            channel_wise=True,
            verbose=None,
            Fs=instance_eeg.info["sfreq"],
            freqs=None,
            method=filter_method,
            notch_widths=kwargs["notch_widths"],
            mt_bandwidth=kwargs["mt_bandwidth"],
            p_value=kwargs["p_value"],
        )
    elif filter_method == 'fir':
        instance_eeg.apply_function(
            fun=mne.filter.notch_filter,
            picks=channels_idxs,
            dtype=None,
            n_jobs=1,
            channel_wise=True,
            verbose=None,
            Fs=instance_eeg.info["sfreq"],
            freqs=tuple(notch_freqs),
            method=filter_method,
            notch_widths=kwargs["notch_widths"],
            trans_bandwidth=kwargs["trans_bandwidth"],
            phase=kwargs["phase"],
            fir_window=kwargs["fir_window"],
            fir_design=kwargs["fir_design"],
        )
    else:
        instance_eeg.apply_function(
            fun=mne.filter.notch_filter,
            picks=channels_idxs,
            dtype=None,
            n_jobs=1,
            channel_wise=True,
            verbose=None,
            Fs=instance_eeg.info["sfreq"],
            freqs=tuple(notch_freqs),
            method=filter_method,
            notch_widths=kwargs["notch_widths"],
            iir_params=kwargs["iir_params"]
        )

    return instance_eeg


def custom_filter(instance, low_freq=None, high_freq=None, channels=None, filter_method='fir', **kwargs):

    instance_eeg = instance.copy().pick_types(eeg=True)
    instance_eeg.load_data()

    if channels == None:  # Si es None, aplico el filtrado en todos los canales tipo EEG
        channels_idxs = mne.pick_types(instance.info, eeg=True)
    else:
        channels_idxs = mne.pick_channels(
            instance_eeg.info['ch_names'], include=channels)

    if filter_method == 'fir':
        instance_filtered = instance_eeg.filter(
            l_freq=low_freq,
            h_freq=high_freq,
            picks=channels_idxs,
            method=filter_method,
            l_trans_bandwidth=kwargs["l_trans_bandwidth"],
            h_trans_bandwidth=kwargs["h_trans_bandwidth"],
            phase=kwargs["phase"],
            fir_window=kwargs["fir_window"],
            fir_design=kwargs["fir_design"],
        )
    else:
        instance_filtered = instance_eeg.filter(
            l_freq=low_freq,
            h_freq=high_freq,
            picks=channels_idxs,
            method=filter_method,
            iir_params=kwargs["iir_params"]
        )

    return instance_filtered


def peak_finder(instance, channels=None, thresh=None):

    instance_eeg = instance.copy().pick_types(eeg=True)

    if channels == None:  # Si es None, aplico el filtrado en todos los canales tipo EEG
        channels_idxs = mne.pick_types(instance.info, eeg=True)
    else:
        channels_idxs = mne.pick_channels(
            instance_eeg.info['ch_names'], include=channels)

    time_series = instance_eeg.get_data(picks=channels_idxs)
    peaks = []

    for serie in time_series:
        locs, amplitudes = mne.preprocessing.peak_finder(serie, thresh=thresh)
        peaks.append({"locations": locs, "amplitudes": amplitudes})

    return peaks
