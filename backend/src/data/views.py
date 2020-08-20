
#----IMPORTS----#
'''
from django.shortcuts import render
from django.http import HttpResponse

from rest_framework import generics, viewsets

from .models import EEG

from .serializers import EEGSerializer

####VIEWS####

class EEGViewSet(viewsets.ModelViewSet):
    queryset = EEG.objects.all()
    serializer_class = EEGSerializer

    def post(self, request, *args, **kwargs):
        upload=request.data['upload']
        EEG.objects.create(upload=upload)
        return HttpResponse({'message':'EEG uploaded'}, status=200)

'''