from django.conf.urls import url
from data.views import EEGInfoView

urlpatterns = [
    url(r'^info/$', EEGInfoView.as_view(), name='info'),
]
