//import React from 'react';
export default [
  {
    id: null,
    type: 'input',
    elementType: 'time series',
    sourcePosition: 'right',
    data: {
      label: 'Señal en tiempo'
    },
    position: { x: 450, y: 80 },
  },
  //PLOTS//
  {
    id: null,
    type: 'output',
    elementType: 'plot time series',
    targetPosition: 'left',
    data: {
      label: 'Grafico en tiempo'
    },
    position: { x: 450, y: 80 },
    params:null,
  },
  {
    id: null,
    type: 'output',
    elementType: 'plot fourier',
    targetPosition: 'left',
    data: {
      label: 'Espectro'
    },
    position: { x: 450, y: 80 },
    params:null,
  },
  {
    id: null,
    type: 'output',
    elementType: 'plot time - frequency',
    targetPosition: 'left',
    data: {
      label: 'Tiempo - Frecuencia'
    },
    position: { x: 450, y: 80 },
    params:null,
  },
  ////////
  //PREPROCESSING METHODS//
  {
    id: null,
    type: 'default',
    elementType: 'events',
    formType:'ENABLE_EVENT_FORM',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Eventos'
    },
    position: { x: 450, y: 80 },
    params:null,
  },
  {
    id: null,
    type: 'default',
    elementType: 'time window',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Ventana Temporal'
    },
    position: { x: 450, y: 80 },
    params:null,
  },
  {
    id: null,
    type: 'default',
    elementType: 'remove',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Eliminar'
    },
    position: { x: 450, y: 80 },
    params:null,
  },
  /////////////////////////
  //FILTERS//
  {
    id: null,
    type: 'default',
    elementType: 'beta',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Filtro Beta'
    },
    position: { x: 450, y: 80 },
    params:null,
  },
  {
    id: null,
    type: 'default',
    elementType: 'alpha',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Filtro Alpha'
    },
    position: { x: 450, y: 80 },
    params:null,
  },
  {
    id: null,
    type: 'default',
    elementType: 'theta',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Filtro Theta'
    },
    position: { x: 450, y: 80 },
    params:null,
  },
  {
    id: null,
    type: 'default',
    elementType: 'delta',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Filtro Delta'
    },
    position: { x: 450, y: 80 },
    params:null,
  },
  {
    id: null,
    type: 'default',
    elementType: 'custom filter',
    targetPosition: 'left',
    sourcePosition: 'right',
    formType:'ENABLE_FILTER_SELECTOR_FORM',
    data: {
      label: 'Filtro Personalizado'
    },
    position: { x: 450, y: 80 },
    params:null,
  },
  ////////
  //METHODS//
  {
    id: null,
    type: 'default',
    elementType: 'ica',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'ICA'
    },
    position: { x: 450, y: 80 },
    params:null,
  },
  {
    id: null,
    type: 'default',
    elementType: 'max peak',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Pico maximo'
    },
    position: { x: 450, y: 80 },
    params:null,
  }
  ////////
];