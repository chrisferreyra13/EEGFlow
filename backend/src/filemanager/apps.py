from django.apps import AppConfig

import importlib
import os
import logging
import filemanager.filemanager_settings as local_settings
from django.core.exceptions import ImproperlyConfigured

LOG = logging.getLogger(__name__)


class DjangoDrfFileManagerConfig(AppConfig):
    name = 'filemanager'
    verbose_name = 'FileManager Server-side API'

    def ready(self):
        upload_tmp = getattr(
            local_settings, 'UPLOAD_TMP',
            os.path.join(local_settings.BASE_DIR, 'filemanager_uploads'))

        LOG.debug('Upload temp directory from top level settings: <%s>'
                  % (upload_tmp))

        # Check if the temporary file directory is available and if not
        # create it.
        if not os.path.exists(local_settings.UPLOAD_TMP):
            LOG.warning('FileManager app init: Creating temporary file '
                        'upload directory <%s>' % local_settings.UPLOAD_TMP)
            os.makedirs(local_settings.UPLOAD_TMP, mode=0o700)
        else:
            LOG.debug('FileManager app init: Temporary file upload '
                      'directory already exists')

        # See if we're using a local file store or django-storages
        # If the latter, we create an instance of the storage class
        # to make sure that it's available and dependencies are installed
        storage_class = getattr(local_settings, 'STORAGES_BACKEND', None)
        if storage_class:
            LOG.info('Using django-storages with backend [%s]'
                     % storage_class)
            (modname, clname) = storage_class.rsplit('.', 1)
            # Either the module import or the getattr to instantiate the
            # class will throw an exception if there's a problem
            # creating storage backend instance due to missing configuration
            # or dependencies.
            mod = importlib.import_module(modname)
            getattr(mod, clname)()
            LOG.info('Storage backend [%s] is available...' % storage_class)
        else:
            LOG.info('App init: no django-storages backend configured, '
                     'using default (local) storage backend if set, '
                     'otherwise you need to manage file storage '
                     'independently of this app.')

        file_store = getattr(local_settings, 'FILE_STORE_PATH', None)
        if file_store:
            if not os.path.exists(file_store):
                LOG.warning('FileManager app init: Creating file store '
                            'directory <%s>...' % file_store)
                os.makedirs(file_store, mode=0o700)
            else:
                LOG.debug('FileManager app init: File store path already '
                          'exists')
        else:
            if not storage_class:
                LOG.error('You are using local file storage so you must set '
                          'the base file storage path using %sFILE_STORE_PATH'
                          % local_settings._app_prefix)
                raise ImproperlyConfigured(
                    'You are using local file storage so you must set the '
                    'base file storage path using %sFILE_STORE_PATH'
                    % local_settings._app_prefix)
