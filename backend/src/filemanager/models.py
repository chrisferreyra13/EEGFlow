#----IMPORTS----#
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging
import os

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.core.validators import MinLengthValidator
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.utils.deconstruct import deconstructible

import filemanager.filemanager_settings as local_settings
from django.utils.functional import LazyObject
from filemanager.storage_utils import _get_storage_backend

#----VARIABLES----#
LOG = logging.getLogger(__name__)

FILEMANAGER_UPLOAD_TMP = getattr(
    local_settings, 'UPLOAD_TMP',
    os.path.join(local_settings.BASE_DIR, 'filemanager_uploads'))

FILEMANAGER_FILE_STORE_PATH = getattr(local_settings, 'FILE_STORE_PATH', None)

#----FUNCTIONS----#
def get_upload_path(instance, filename):
    return os.path.join(instance.upload_id, filename)
    
#----MODELS----#
@deconstructible
class FileManagerUploadSystemStorage(FileSystemStorage):
    """
    Subclass FileSystemStorage to prevent creation of new migrations when
    using a file store location passed to FileSystemStorage using the
    location attribute. Instead the location is applied dynamically on
    creation of the subclass avoiding detection of changes by the migration
    system.
    """

    def __init__(self, **kwargs):
        kwargs.update({
            'location': FILEMANAGER_UPLOAD_TMP,
        })
        super(FileManagerUploadSystemStorage, self).__init__(**kwargs)


storage = FileManagerUploadSystemStorage()


@deconstructible
class FileManagerLocalStoredStorage(FileSystemStorage):
    """
    Subclass FileSystemStorage to prevent creation of new migrations when
    using a file store location passed to FileSystemStorage using the
    location attribute. Instead the location is applied dynamically on
    creation of the subclass avoiding detection of changes by the migration
    system.
    """

    def __init__(self, **kwargs):
        kwargs.update({
            'location': FILEMANAGER_FILE_STORE_PATH,
        })
        super(FileManagerLocalStoredStorage, self).__init__(**kwargs)


class DrfFileManagerStoredStorage(LazyObject):

    def _setup(self):
        # Work out which storage backend we need to use and then
        # instantiate it and assign it to self._wrapped
        storage_module_name = getattr(local_settings, 'STORAGES_BACKEND', None)
        LOG.debug('Initialising storage backend with storage module name [%s]'
                  % storage_module_name)
        storage_backend = _get_storage_backend(storage_module_name)
        if not storage_backend:
            self._wrapped = FileManagerLocalStoredStorage()
        else:
            self._wrapped = storage_backend


class TemporaryUpload(models.Model):

    FILE_DATA = 'F'
    URL = 'U'
    UPLOAD_TYPE_CHOICES = (
        (FILE_DATA, 'Uploaded file data'),
        (URL, 'Remote file URL'),
    )

    # The unique ID returned to the client and the name of the temporary
    # directory created to hold file data
    upload_id = models.CharField(primary_key=True, max_length=22,
                                 validators=[MinLengthValidator(22)])
    # The unique ID used to store the file itself
    file_id = models.CharField(max_length=22,
                               validators=[MinLengthValidator(22)])
    file = models.FileField(storage=storage, upload_to=get_upload_path)
    upload_name = models.CharField(max_length=512)
    uploaded = models.DateTimeField(auto_now_add=True)
    upload_type = models.CharField(max_length=1,
                                   choices=UPLOAD_TYPE_CHOICES)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True,
                                    blank=True, on_delete=models.CASCADE)

    def get_file_path(self):
        return self.file.path


class TemporaryUploadChunked(models.Model):
    # The unique ID returned to the client and the name of the temporary
    # directory created to hold file data - this will be re-used in the
    # main TemporaryUpload record for this upload if/when all the chunks have
    # been successfully received and the upload is finalised.
    upload_id = models.CharField(primary_key=True, max_length=22,
                                 validators=[MinLengthValidator(22)])
    # The unique ID used to store the file chunks which are appended with
    # _<chunk_num>
    file_id = models.CharField(max_length=22,
                               validators=[MinLengthValidator(22)])
    upload_dir = models.CharField(max_length=512, default=upload_id)
    last_chunk = models.IntegerField(default=0)
    offset = models.IntegerField(default=0)
    total_size = models.IntegerField(default=0)
    upload_name = models.CharField(max_length=512, default='')
    upload_complete = models.BooleanField(default=False)
    last_upload_time = models.DateTimeField(auto_now=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True,
                                    blank=True, on_delete=models.CASCADE)


class StoredUpload(models.Model):

    # The unique upload ID assigned to this file when it was originally
    # uploaded (or retrieved from a remote URL)
    upload_id = models.CharField(primary_key=True, max_length=22,
                                 validators=[MinLengthValidator(22)])
    # The file name and path (relative to the base file store directory
    # as set by FILEMANAGER_FILE_STORE_PATH).
    file = models.FileField(storage=DrfFileManagerStoredStorage(),
                            max_length=2048)
    uploaded = models.DateTimeField()
    stored = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True,
                                    blank=True, on_delete=models.CASCADE)

    def get_absolute_file_path(self):
        fsp = local_settings.FILE_STORE_PATH
        if not fsp:
            fsp = ''
        return os.path.join(fsp, self.file.name)


# When a TemporaryUpload record is deleted, we need to delete the
# corresponding file from the filesystem by catching the post_delete signal.
@receiver(post_delete, sender=TemporaryUpload)
def delete_temp_upload_file(sender, instance, **kwargs):
    # Check that the file parameter for the instance is not None
    # and that the file exists and is not a directory! Then we can delete it
    LOG.debug('*** post_delete signal handler called. Deleting file.')
    if instance.file:
        if (os.path.exists(instance.file.path) and
                os.path.isfile(instance.file.path)):
            os.remove(instance.file.path)

    if local_settings.DELETE_UPLOAD_TMP_DIRS:
        file_dir = os.path.join(storage.location, instance.upload_id)
        if(os.path.exists(file_dir) and os.path.isdir(file_dir)):
            os.rmdir(file_dir)
            LOG.debug('*** post_delete signal handler called. Deleting temp '
                      'dir that contained file.')
