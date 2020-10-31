
#----IMPORTS----#

from django.db import models

####FUNCTIONS####
'''
def upload_path(instance, filename):
    return '/'.join(['data',filename])
'''

####MODELS####

class EEGInfo(models.Model):
    '''
    -filename
    -Numero de canales
    -Numero de frames por epoca
    -Numero de epocas
    -Numero de eventos
    -Frecuencia de muestreo
    -Tiempo de inicio de epoca
    -Tiempo de fin de epoca
    -Referencia
    -Ubicacion de los canales
    -Pesos ICA
    -Tamaño del dataset
    '''

    #file_id=models.CharField(max_length=22) # TODO: UUIDField?
    nchan=models.IntegerField()
    experimenter=models.CharField(max_length=50, null=True)
    proj_name=models.CharField(max_length=50, null=True)
    proj_id=models.CharField(max_length=50, null=True)
    meas_date=models.DateTimeField(null=True)
    ch_names=models.CharField(max_length=100)
    custom_ref_applied=models.BooleanField()
    #n_times=models.IntegerField()





