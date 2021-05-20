import {
    ADD_NODE,
    UPDATE_NODE_PROPIERTIES,
    UPDATE_AFTER_DELETE_ELEMENTS,
    ADD_EDGE,
    CHANGE_EDGE,
    FETCH_RUN_PROCESS_REQUEST,
    FETCH_RUN_PROCESS_RECEIVE,
    FETCH_RUN_PROCESS_FAILURE,
    PROCESSES_TO_START,
    FETCH_TIME_SERIES_REQUEST,
    FETCH_TIME_SERIES_RECEIVE,
    FETCH_TIME_SERIES_FAILURE,
    SET_NODE_FILE_ID,
} from '../actions/Diagram';

import allowedElements from './_elements';


const initialState={
    elements:[{
        id: '1',
        type: 'input',
        elementType: 'TIME_SERIES',
        sourcePosition:'right',
        data: { label: 'Señal en tiempo' },
        position: { x: 150, y: 50 },
        draggable:false,
        params:{
            id:'12',
            data: [],
            sFreq: 0,
            chNames: [],
            
        },
        isFetching:false,
    },
    {
        id: '2',
        type: 'output',
        elementType: 'PLOT_TIME_SERIES',
        targetPosition:'left',
        data: { label: 'Grafico en tiempo' },
        position: { x: 500, y: 20 },
        draggable:true,
        params:{
            data:[],
            channels:null,
        },
        fetchInput:false,
    },
    {
        animated:true,
        arrowHeadType: "arrowclosed",
        id: "reactflow__edge-1null-2null",
        source:"1",
        style:{stroke:"blue"},
        target:"2",
    },
    ],
    nodesCount: 2,
    lastId: 2,
    processes_status:[] //[TOSTART, PROCESSING, SUCCESFULL, FAIL]
}

export const diagram= (state=initialState, {type, ...rest})=>{
    switch(type){
        case ADD_NODE: 
            var copyState=Object.assign({},state);
            var nodeIndex=lastNodeIndex(copyState.elements)//,copyState.lastId)
            copyState.elements.push(Object.assign({},allowedElements.find(element => element.elementType===rest.elementType)));
            copyState.lastId=parseInt(copyState.elements[nodeIndex].id)+1;
            copyState.nodesCount=copyState.nodesCount+1
            copyState.elements[copyState.elements.length-1].id=(copyState.lastId).toString();
            var position=copyState.elements[nodeIndex].position
            copyState.elements[copyState.elements.length-1].position=Object.assign({},position,{
                                                                        x: position.x+200,
                                                                        y: position.y+100
                                                                    })

            return Object.assign({},state,{
                elements: copyState.elements,
                nodesCount: copyState.nodesCount,
                lastId: copyState.lastId
            })

        case UPDATE_NODE_PROPIERTIES:
            var copyState=Object.assign({},state);
            var propierties=Object.getOwnPropertyNames(rest.propierties);
            var idx='0'
            if(rest.id==''){
                idx=lastNodeIndex(copyState.elements)
            }else{
                idx=copyState.elements.findIndex(elem => elem.id==rest.id)
            }
            for(let prop of propierties){
                copyState.elements[idx][prop]=rest.propierties[prop];
            }
            return Object.assign({},state,{
                elements:copyState.elements
            })

        case UPDATE_AFTER_DELETE_ELEMENTS:
            /*
            return Object.assign({},state,{
                elements: state.elements.filter(function(element){
                    return !rest.nodesIds.includes(element.id.toString())
                }),
                idCount:state.idCount-rest.nodesIds.length
            })
            */
            return Object.assign({},state,{
                elements: rest.newElements,
                nodesCount:state.nodesCount-rest.numOfNodesRemoved
            })
        
        case ADD_EDGE:
            return Object.assign({},state,{
                elements: rest.newElements,
            })
            
        case CHANGE_EDGE:
            return Object.assign({},state,{
                elements: rest.newElements,
            })

        case PROCESSES_TO_START:
            let i=0
            var processes_status=[]
            for(i;i<rest.numberOfProcesses;i++){
                processes_status.push('TOSTART')
            }
            return Object.assign({},state,{
                processes_status: processes_status, //PROCESSING
            })
        
        case SET_NODE_FILE_ID:
            var copyState=Object.assign({},state);
            var idx=copyState.elements.findIndex(n => n.elementType=='TIME_SERIES')
            copyState.elements[idx].params.id=rest.fileId
            return Object.assign({},state, {
                elements: copyState.elements,
            })
        

        case FETCH_RUN_PROCESS_REQUEST:
            var processes_status=Object.assign({},state.processes_status)
            processes_status[rest.process['process_id']]='PROCESSING'
            return Object.assign({},state,{
                processes_status: processes_status, //PROCESSING
            })
        
        case FETCH_RUN_PROCESS_RECEIVE:
            var copyState=Object.assign({},state);
            
            copyState.processes_status[rest.process['process_id']]=rest.process["process_status"]
            
            var idx=copyState.elements.findIndex(n => n.id==rest.process["node_output_id"])
            copyState.elements[idx].fetchInput=true //Ya puedo ir a buscar el resultado
            return Object.assign({},state,{
                processes_status: copyState.processes_status, //SUCCESFULL
                elements:copyState.elements,
            })

        case FETCH_RUN_PROCESS_FAILURE:
            var processes_status=Object.assign({},state.processes_status)
            processes_status[rest.process['process_id']]=rest.process["process_status"]
            return Object.assign({},state,{
                process_status: processes_status, //FAIL
            })
        
        case FETCH_TIME_SERIES_REQUEST:
            var copyState=Object.assign({},state);
            var idx=copyState.elements.findIndex(n => n.elementType=='TIME_SERIES')
            copyState.elements[idx].isFetching=true
            return Object.assign({},state, {
                elements: copyState.elements,
            })
        case FETCH_TIME_SERIES_RECEIVE:
            var copyState=Object.assign({},state);
            var idx=copyState.elements.findIndex(n => n.elementType=='TIME_SERIES')
            copyState.elements[idx].params.data=rest.timeSeries['signal']
            copyState.elements[idx].params.sFreq=rest.timeSeries['sampling_freq']
            copyState.elements[idx].params.chNames=rest.timeSeries['ch_names']
            copyState.elements[idx].isFetching=false
            return Object.assign({},state, {
                elements: copyState.elements,
            })
        case FETCH_TIME_SERIES_FAILURE:
            return {...state, ...rest}


        default:
            return state
    }
}

const lastNodeIndex = (elements) => {
    var i=0
    var id=0
    for(i;i<elements.length;i++){
        if(elements[i].elementType!=undefined){
            id=i
        }
    }
    return id
    //return elements.findIndex((element)=> element.id===lastId.toString())
}