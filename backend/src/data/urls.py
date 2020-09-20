from django.conf.urls import url
from data.views import EEGInfoView, EEGTemporalSignal

urlpatterns = [
    url(r'^eeg/info/$', EEGInfoView.as_view(), name='EEGInfo'),
    url(r'^eeg/temporal-signal/$', EEGTemporalSignal.as_view(), name='EEGTemporalSignal'),
]
