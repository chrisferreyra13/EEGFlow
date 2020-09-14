import mne
import os

from django.conf import settings

MEDIA_TEMP=os.path.join(settings.BASE_DIR, 'media-temp')
MEDIA_STORED=os.path.join(settings.BASE_DIR, 'media-stored')


def get_raw(upload_id):
    #raw=mne.io.read_raw_fif(MEDIA_TEMP+'/'+upload_id)
    raw=mne.io.read_raw_eeglab(MEDIA_TEMP+'/'+upload_id)
    return raw