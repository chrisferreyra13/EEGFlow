from rest_framework import serializers
from .models import EEG


class EEGSerializer(serializers.ModelSerializer):
    class Meta:
        model = EEG
        fields = (
            'upload',
        )
        