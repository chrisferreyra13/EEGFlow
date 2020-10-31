from django.conf.urls import url
from data.views import EEGInfoView, EEGTimeSeries

urlpatterns = [
    url(r'^eeg/info/$', EEGInfoView.as_view(), name='EEGInfo'),
    url(r'^eeg/time-series/$', EEGTimeSeries.as_view(), name='EEGTimeSeries'),
]
