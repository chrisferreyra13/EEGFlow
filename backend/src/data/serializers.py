####IMPORTS####

from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator

from .models import EEGInfo

####FUNCTIONS####

class DictionaryAdapter(object):
    def __init__(self, dictionary): 
        self.dictionary = dictionary 

####SERIALIZERS####

class EEGInfoSerializer(serializers.ModelSerializer):
    #dictionary = serializers.DictField(child = serializers.CharField())
    class Meta:
        model=EEGInfo
        fields=[
            'nchan',
            'experimenter',
            'proj_name',
            'proj_id',
            'meas_date',
            'ch_names',
            'custom_ref_applied',
        ]
        '''
        validators=[
            UniqueTogetherValidator(queryset=EEGInfo.objects.all(),
            fields=[
            'nchan',
            'experimenter',
            'proj_name',
            'proj_id',
            'meas_date',
            'ch_names',
            'custom_ref_applied',
        ]),
        ]
        '''
    def create(self, validated_data):
        eeg=EEGInfo(nchan=validated_data['nchan'],experimenter=validated_data['experimenter'],meas_date=validated_data['meas_date'],
                            proj_name=validated_data['proj_name'],proj_id=validated_data['proj_id'],
                            ch_names=validated_data['ch_names'],
                            custom_ref_applied=validated_data['custom_ref_applied'])

        eeg.save()
        

