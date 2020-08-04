from .base import *

DEBUG = True #poner en false para q no aparezca la "ventana de errores" de django

ALLOWED_HOSTS = ['neurodata.herokuapp.com']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'd1q97slu3ksn37',
        'USER': 'dsetgztaqjgmip',
        'PASSWORD': '643408f67c1d5158a0eb55a2228547f72ff95dfc3b8be90034ba06e497db1da1',
        'HOST': 'ec2-54-81-37-115.compute-1.amazonaws.com',
        'PORT': '5432',
    }
}

STATICFILES_DIRS=(BASE_DIR,'static')