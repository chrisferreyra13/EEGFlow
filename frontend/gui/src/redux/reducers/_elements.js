const paramsTemplate={
  id:'40',
}
const signalsDataTemplate=[{
  id:null,
  dataReady:false,
  data: [],
  dataType:null,
  sFreq: 0,
  chNames: [], 
}]

const processParamsTemplate={
  processed:false,
}


export default [
  {
    id: null,
    type: 'input',
    elementType: 'TIME_SERIES',
    sourcePosition: 'right',
    data: {
      label: 'Señal en tiempo'
    },
    position: { x: 550, y: 80 },
    params:paramsTemplate,
    signalsData:signalsDataTemplate,
    isFetching:false,
  },
  //PLOTS//
  {
    id: null,
    type: 'output',
    elementType: 'PLOT_TIME_SERIES',
    formType:'ENABLE_PLOT_TIME_SERIES_FORM',
    targetPosition: 'left',
    data: {
      label: 'Grafico en tiempo'
    },
    position: { x: 550, y: 80 },
    params:{
      channels:null,
      minTimeWindow:null,
      maxTimeWindow:null,
      size:null,
    },
    inputData:{
      fetchInput:false,
      inputNodeId:'',

    },
    processParams:processParamsTemplate,
  },
  {
    id: null,
    type: 'output',
    elementType: 'PLOT_PSD',
    formType:'ENABLE_PLOT_PSD_FORM',
    targetPosition: 'left',
    data: {
      label: 'PSD'
    },
    position: { x: 550, y: 80 },
    params:{
      channels:null,
      minFreqWindow:null,
      maxFreqWindow:null,
      minTimeWindow:null,
      maxTimeWindow:null,
      size:null,
    },
    inputData:{
      fetchInput:false,
      inputNodeId:'',

    },
    processParams:processParamsTemplate,
  
  },
  {
    id: null,
    type: 'output',
    elementType: 'PLOT_TIME_FREQUENCY',
    targetPosition: 'left',
    data: {
      label: 'Tiempo - Frecuencia'
    },
    position: { x: 550, y: 80 },
    params:{
      channels:null,
      minXWindow:null,
      maxXWindow:null,
      size:null,
    },
    inputData:{
      fetchInput:false,
      inputNodeId:'',

    },
    processParams:processParamsTemplate,
  },
  ////////
  //PREPROCESSING METHODS//
  {
    id: null,
    type: 'default',
    elementType: 'EVENTS',
    formType:'ENABLE_EVENT_FORM',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Eventos'
    },
    position: { x: 550, y: 80 },
    params:null,
  },
  {
    id: null,
    type: 'default',
    elementType: 'TIME_WINDOW',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Ventana Temporal'
    },
    position: { x: 550, y: 80 },
    params:null,
  },
  {
    id: null,
    type: 'default',
    elementType: 'REMOVE',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Eliminar'
    },
    position: { x: 550, y: 80 },
    params:null,
  },
  /////////////////////////
  //FILTERS//
  {
    id: null,
    type: 'default',
    elementType: 'NOTCH',
    formType:'ENABLE_NOTCH_FILTER_FORM',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Filtro Notch'
    },
    position: { x: 550, y: 80 },
    params:{
      id:null,
    },
    signalsData:signalsDataTemplate,
    processParams:processParamsTemplate,
  },
  {
    id: null,
    type: 'default',
    elementType: 'BETA',
    formType:'ENABLE_COMMON_FILTER_FORM',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Filtro Beta'
    },
    position: { x: 550, y: 80 },
    params:{
      id:null,
    },
    signalsData:signalsDataTemplate,
    processParams:processParamsTemplate,
  },
  {
    id: null,
    type: 'default',
    elementType: 'ALPHA',
    formType:'ENABLE_COMMON_FILTER_FORM',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Filtro Alpha'
    },
    position: { x: 550, y: 80 },
    params:{
      id:null,
    },
    signalsData:signalsDataTemplate,
    processParams:processParamsTemplate,
  },
  {
    id: null,
    type: 'default',
    elementType: 'THETA',
    formType:'ENABLE_COMMON_FILTER_FORM',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Filtro Theta'
    },
    position: { x: 550, y: 80 },
    params:{
      id:null,
    },
    signalsData:signalsDataTemplate,
    processParams:processParamsTemplate,
  },
  {
    id: null,
    type: 'default',
    elementType: 'DELTA',
    formType:'ENABLE_COMMON_FILTER_FORM',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Filtro Delta'
    },
    position: { x: 550, y: 80 },
    params:{
      id:null,
    },
    signalsData:signalsDataTemplate,
    processParams:processParamsTemplate,
  },
  {
    id: null,
    type: 'default',
    elementType: 'CUSTOM_FILTER',
    targetPosition: 'left',
    sourcePosition: 'right',
    formType:'ENABLE_CUSTOM_FILTER_FORM',
    data: {
      label: 'Filtro Personalizado'
    },
    position: { x: 550, y: 80 },
    params:{
      id:null,
      low_freq:3,
      high_freq:8,
    },
    signalsData:signalsDataTemplate,
    processParams:processParamsTemplate,
  },
  ////////
  //METHODS//
  {
    id: null,
    type: 'default',
    elementType: 'ICA',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'ICA'
    },
    position: { x: 550, y: 80 },
    params:null,
    signalsData:signalsDataTemplate,
    processParams:processParamsTemplate,
  },
  {
    id: null,
    type: 'default',
    elementType: 'MAX_PEAK',
    targetPosition: 'left',
    sourcePosition: 'right',
    data: {
      label: 'Pico maximo'
    },
    position: { x: 550, y: 80 },
    params:{
      thresh:null, //(max(x0) - min(x0)) / 4.
      channels:["EEG 001","EEG 002" ],
            
    },
    signalsData:signalsDataTemplate,
    processParams:processParamsTemplate,
  }
  ////////
];