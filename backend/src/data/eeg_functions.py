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