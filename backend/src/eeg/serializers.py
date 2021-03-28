####IMPORTS####

from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from .models import FileInfo

import mne

####FUNCTIONS####
#No darle mucha bola a esto, eliminar mas adelante
class DictionaryAdapter(object):
    def __init__(self, dictionary): 
        self.dictionary = dictionary 

####SERIALIZERS####

class FileInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model=FileInfo
        fields=[
            'upload_id',
            'proj_id',
            'proj_name',
            'experimenter',
            'meas_date',
            'nchan',
            'ch_names',
            'custom_ref_applied',
        ]
        
        validators=[
            UniqueTogetherValidator(queryset=FileInfo.objects.all(),
            fields=[
            'upload_id',
            'proj_id',
            'proj_name',
            'experimenter',
            'meas_date',
            'nchan',
            'ch_names',
            'custom_ref_applied',
        ]),
        ]
        
    
    def create(self, validated_data):
        eeg=FileInfo(**validated_data)
        eeg.save()
        return eeg
    
    def update(self, instance, validated_data):
        instance.upload_id=validated_data.get('upload_id', instance.upload_id)
        instance.proj_id=validated_data.get('proj_id', instance.proj_id)
        instance.proj_name=validated_data.get('proj_name', instance.proj_name)
        instance.experimenter=validated_data.get('experimenter', instance.experimenter)
        instance.meas_date=validated_data.get('meas_date', instance.meas_date)
        instance.nchan=validated_data.get('nchan', instance.nchan)
        instance.ch_names=validated_data.get('ch_names', instance.ch_names)
        instance.custom_ref_applied=validated_data.get('custom_ref_applied', instance.custom_ref_applied)
        instance.save()
        return instance

'''
class TimeSeriesSerializer(serializers.ModelSerializer):
    #dictionary = serializers.DictField(child = serializers.CharField())
    class Meta:
        model=EEGInfo
        fields=[
            'proj_id',
            'proj_name',
            'experimenter',
            'meas_date',
            'nchan',
            'ch_names',
            'custom_ref_applied',
        ]
'''
'''class EEGEventsSerializer(serializers.Serializer):
    eventTime
    eventId
    eventDescription
'''