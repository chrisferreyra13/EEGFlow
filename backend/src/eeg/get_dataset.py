
import mne
import os
from mne.datasets import sample

#sample.data_path()

raw=mne.io.read_raw_edf('/home/cfmaster/Downloads/S001R03.edf')
events=mne.events_from_annotations(raw)
print(events)