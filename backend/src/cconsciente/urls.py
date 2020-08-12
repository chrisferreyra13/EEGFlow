"""cconsciente URL Configuration
"""
from django.contrib import admin
from django.urls import include, path
from django.conf.urls import url
from rest_framework import routers
#from data.views import EEGViewSet

#router=routers.DefaultRouter()

#router.register('data/eeg',EEGViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    url(r'^fm/', include('filemanager.urls')),
    #path('', include(router.urls)),
]