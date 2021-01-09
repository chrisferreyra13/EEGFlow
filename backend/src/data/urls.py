from django.conf.urls import url
from data.views import EEGInfoView, EEGTimeSeries, EEGGetEvents

urlpatterns = [
    url(r'^eeg/info/$', EEGInfoView.as_view(), name='EEGInfo'),
    url(r'^eeg/time-series/$', EEGTimeSeries.as_view(), name='EEGTimeSeries'),
    url(r'^eeg/events/$', EEGGetEvents.as_view(), name='EEGGetEvents'),
]
