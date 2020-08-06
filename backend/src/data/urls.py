from django.urls import path

from . import views

urlpatterns = [
    path('eeg/', views.EEGViewSet),
]