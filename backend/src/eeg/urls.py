from django.conf.urls import url
from .views import *

urlpatterns = [
    url(r'^info/$', FileInfoView.as_view(), name='GetFileInfo'),
    url(r'^info/$', FileInfoView.as_view(), name='PostFileInfo'),
    url(r'^process/$', RunProcess.as_view(),name='RunProcess'),
    url(r'^time_series/$', GetTimeSeries.as_view(), name='GetTimeSeries'),
    url(r'^events/$', GetEvents.as_view(), name='GetEvents'),
    url(r'^methods/filters/notch/$', NotchFilterView.as_view(),name='NotchFilter'),
    url(r'^methods/filters/custom/$', CustomFilterView.as_view(),name='CustomFilter'),
    url(r'^methods/peak_finder/$', PeakView.as_view(),name='PeakFinder'),
]
