# EEGFlow: Project Overview 
* Web app for EEG signal processing using diagrams.
* Each block is a common method in EEG processing pipeline.
* Different visualizations like PSD with Welch method, time-frequency with Morlet's wavelets or Multitapers method and ITC.
* Filtering with 4th order Butterworth IIR filter or FIR filters with common windows like Blackman, Hamming and Hann.
* Epochs and events management.

## Code and Resources Used 
**Backend Packages:** Python 3.8, Django 3.0.7, Django REST framework 3.12.2, MNE 0.24.1.
**Frontend Packages:** Redux.js 4.0.5, Arction.js 3.2, React Flow 8.8.0. 

## Example
### Processing pipeline
![alt text](https://github.com/chrisferreyra13/EEGFlow/blob/master/frontend/gui/public/images/diagram1.png "Diagram example")

### Plots
![alt text](https://github.com/chrisferreyra13/EEGFlow/blob/master/frontend/gui/public/images/time-freq1.png "Time-frequency plot")
![alt text](https://github.com/chrisferreyra13/EEGFlow/blob/master/frontend/gui/public/images/time-events.png "Time series with events plot")
