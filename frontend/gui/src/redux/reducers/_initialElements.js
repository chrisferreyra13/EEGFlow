const paramsTemplate = {
    id: '40',
}
const signalsDataTemplate = [{
    id: null,
    dataReady: false,
    data: [],
    dataType: null,
    sFreq: 0,
    chNames: [],
}]

const processParamsTemplate = {
    processed: false,
}

export default [
    // 0: Initial app test
    [
        {
            id: '1',
            type: 'input',
            elementType: 'TIME_SERIES',
            sourcePosition: 'right',
            data: { label: 'Señal en tiempo' },
            position: { x: 150, y: 50 },
            draggable: false,
            params: {
                id: null,
            },
            signalsData: signalsDataTemplate,
            processParams: {
                processed: false,
            },
        },
        {
            id: '2',
            type: 'output',
            elementType: 'PLOT_TIME_SERIES',
            formType: 'ENABLE_PLOT_TIME_SERIES_FORM',
            targetPosition: 'left',
            data: { label: 'Grafico en tiempo' },
            //style: { borderColor: '#2eb85c', boxShadow: '0px 0px 0.5px #2eb85c' },
            position: { x: 500, y: 20 },
            draggable: true,
            inputData: {
                fetchInput: true,
                inputNodeId: '1',
                outputType: null,
                summary: null,
            },
            params: {
                channels: null,
                minXWindow: null,
                maxXWindow: null,
                size: 'l',
            },
            processParams: {
                processed: false,
            },

        },
        {
            animated: true,
            arrowHeadType: "arrowclosed",
            id: "reactflow__edge-1null-2null",
            source: "1",
            style: { stroke: "blue" },
            target: "2",
        },
    ],

    // 1: Test filter
    [
        {
            id: '1',
            type: 'input',
            elementType: 'TIME_SERIES',
            sourcePosition: 'right',
            data: { label: 'Señal en tiempo' },
            position: { x: 150, y: 50 },
            draggable: false,
            params: {
                id: null,
            },
            signalsData: [],
            processParams: {
                processed: false,
            },
        },
        {
            id: '2',
            type: 'output',
            elementType: 'PLOT_TIME_SERIES',
            formType: 'ENABLE_PLOT_TIME_SERIES_FORM',
            targetPosition: 'left',
            data: { label: 'Grafico en tiempo' },
            //style: { borderColor: '#2eb85c', boxShadow: '0px 0px 0.5px #2eb85c' },
            position: { x: 550, y: 20 },
            draggable: true,
            inputData: {
                fetchInput: true,
                inputNodeId: '1',
                outputType: null,
                summary: null,
            },
            params: {
                channels: null,
                minXWindow: null,
                maxXWindow: null,
                size: 'l',
            },
            processParams: {
                processed: false,
            },

        },
        {
            id: '3',
            type: 'default',
            elementType: 'NOTCH',
            formType: 'ENABLE_NOTCH_FILTER_FORM',
            targetPosition: 'left',
            sourcePosition: 'right',
            data: {
                label: 'Filtro Notch'
            },
            position: { x: 350, y: 80 },
            params: {
                id:null,
                channels:["EEG 003", "EEG 005"],
                notch_freqs:"10,25",
                fir_window:"hamming",
                trans_bandwidth:"1"
            },
            signalsData: signalsDataTemplate,
            processParams: processParamsTemplate,
        },
        {
            animated: true,
            arrowHeadType: "arrowclosed",
            id: "reactflow__edge-1null-3null",
            source: "1",
            style: { stroke: "blue" },
            target: "3",
        },
        {
            animated: true,
            arrowHeadType: "arrowclosed",
            id: "reactflow__edge-3null-2null",
            source: "3",
            style: { stroke: "blue" },
            target: "2",
        },
    ],
    //Test epoch -> time-freq
    [
        {
            id: '1',
            type: 'input',
            elementType: 'TIME_SERIES',
            sourcePosition: 'right',
            data: { label: 'Señal en tiempo' },
            position: { x: 150, y: 50 },
            draggable: false,
            params: {
                id: null,
            },
            signalsData: [],
            processParams: {
                processed: false,
            },
        },
        {
            id: '2',
            type: 'output',
            elementType: 'PLOT_TIME_FREQUENCY',
            formType: 'ENABLE_PLOT_TIME_FREQUENCY_FORM',
            targetPosition: 'left',
            data: {
                label: 'Tiempo - Frecuencia'
                },
            position: { x: 550, y: 20 },
            draggable: true,
            inputData:{
                fetchInput:false,
                inputNodeId:null,
                outputType:null,
                summary:null,
          
                },
            params:{
                channels:null,
                epochs:null,
                minXWindow:null,
                maxXWindow:null,
                size:null,
                },
            processParams:processParamsTemplate,

        },
        {
            id: '3',
            type: 'default',
            elementType: 'EPOCHS',
            formType:'ENABLE_EPOCH_FORM',
            targetPosition: 'left',
            sourcePosition: 'right',
            data: {
            label: 'Epocas'
            },
            position: { x: 350, y: 80 },
            params:{
                tmin:null,
                tmax:null,
                channels:null,
            },
            signalsData:signalsDataTemplate,
            processParams:processParamsTemplate,
        },
        {
            animated: true,
            arrowHeadType: "arrowclosed",
            id: "reactflow__edge-1null-3null",
            source: "1",
            style: { stroke: "blue" },
            target: "3",
        },
        {
            animated: true,
            arrowHeadType: "arrowclosed",
            id: "reactflow__edge-3null-2null",
            source: "3",
            style: { stroke: "blue" },
            target: "2",
        },
    ],
    //Test: set reference
    [
        {
            id: '1',
            type: 'input',
            elementType: 'TIME_SERIES',
            sourcePosition: 'right',
            data: { label: 'Señal en tiempo' },
            position: { x: 150, y: 50 },
            draggable: false,
            params: {
                id: null,
            },
            signalsData: signalsDataTemplate,
            processParams: {
                processed: false,
            },
        },
        {
            id: '2',
            type: 'output',
            elementType: 'PLOT_TIME_SERIES',
            formType: 'ENABLE_PLOT_TIME_SERIES_FORM',
            targetPosition: 'left',
            data: { label: 'Grafico en tiempo' },
            //style: { borderColor: '#2eb85c', boxShadow: '0px 0px 0.5px #2eb85c' },
            position: { x: 600, y: 40 },
            draggable: true,
            inputData: {
                fetchInput: false,
                inputNodeId:null,
                outputType:null,
                summary:null,
            },
            params: {
                channels: null,
                minXWindow: null,
                maxXWindow: null,
                size: 'l',
            },
            processParams: {
                processed: false,
            },

        },
        {
            id: '4',
            type: 'output',
            elementType: 'PLOT_TIME_SERIES',
            formType: 'ENABLE_PLOT_TIME_SERIES_FORM',
            targetPosition: 'left',
            data: { label: 'Grafico en tiempo' },
            //style: { borderColor: '#2eb85c', boxShadow: '0px 0px 0.5px #2eb85c' },
            position: { x: 550, y: 150 },
            draggable: true,
            inputData: {
                fetchInput: false,
                inputNodeId:null,
                outputType:null,
                summary:null,
            },
            params: {
                channels: null,
                minXWindow: null,
                maxXWindow: null,
                size: 'l',
            },
            processParams: {
                processed: false,
            },

        },
        {
            id: '3',
            type: 'default',
            elementType: 'SET_REFERENCE',
            formType:'ENABLE_SET_REFERENCE_FORM',
            targetPosition: 'left',
            sourcePosition: 'right',
            data: {
              label: 'Cambiar Referencia'
            },
            position: { x: 400, y: 40 },
            params:{
              type:null,
            },
            signalsData:signalsDataTemplate,
            processParams:processParamsTemplate,
        },
        {
            animated: true,
            arrowHeadType: "arrowclosed",
            id: "reactflow__edge-1null-3null",
            source: "1",
            style: { stroke: "blue" },
            target: "3",
        },
        {
            animated: true,
            arrowHeadType: "arrowclosed",
            id: "reactflow__edge-3null-2null",
            source: "3",
            style: { stroke: "blue" },
            target: "2",
        },
        {
            animated: true,
            arrowHeadType: "arrowclosed",
            id: "reactflow__edge-1null-4null",
            source: "1",
            style: { stroke: "blue" },
            target: "4",
        },
    ]

]