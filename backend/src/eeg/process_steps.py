from .eeg_api import *


def time_series_step(params):
    print('busco el archivo ' + params['id'])
    return

def plot_time_series_step(params):
    return



steps={
    'TIME_SERIES': time_series_step,
    'PLOT_TIME_SERIES':plot_time_series_step
}