from django.conf.urls import url
from .views import FileInfoView, GetTimeSeries, GetEvents

urlpatterns = [
    url(r'^info/$', FileInfoView.as_view(), name='GetFileInfo'),
    url(r'^info/$', FileInfoView.as_view(), name='PostFileInfo'),
    url(r'^time_series/$', GetTimeSeries.as_view(), name='GetTimeSeries'),
    url(r'^events/$', GetEvents.as_view(), name='GetEvents'),
]
