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
        dataParams:{
            dataReady:false,
            id:'12',
            data: [],
            sFreq: 0,
            chNames: [],
            
        },
    },
    {
        id: '2',
        type: 'output',
        elementType: 'PLOT_TIME_SERIES',
        targetPosition:'left',
        data: { label: 'Grafico en tiempo' },
        position: { x: 500, y: 20 },
        draggable:true,
        inputData:{
            fetchInput:true,
            inputNodeId:'1',
        },
        params:{
            channels:null,
            minTimeWindow:null,
            maxTimeWindow:null,
            largeSize:null,
            mediumSize:null,
            smallSize:null,
        },
        
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
    processes_status:[], //[TOSTART, PROCESSING, SUCCESFULL, FAIL]
    inputsReady:[]
}

export const diagram= (state=initialState, {type, ...rest})=>{
    switch(type){
        case ADD_NODE: 
            var stateCopy=Object.assign({},state);
            var nodeIndex=lastNodeIndex(stateCopy.elements)//,stateCopy.lastId)
            stateCopy.elements.push(Object.assign({},allowedElements.find(element => element.elementType===rest.elementType)));
            stateCopy.lastId=parseInt(stateCopy.elements[nodeIndex].id)+1;
            stateCopy.nodesCount=stateCopy.nodesCount+1
            stateCopy.elements[stateCopy.elements.length-1].id=(stateCopy.lastId).toString();
            var position=stateCopy.elements[nodeIndex].position
            stateCopy.elements[stateCopy.elements.length-1].position=Object.assign({},position,{
                                                                        x: position.x+200,
                                                                        y: position.y+100
                                                                    })

            return Object.assign({},state,{
                elements: stateCopy.elements,
                nodesCount: stateCopy.nodesCount,
                lastId: stateCopy.lastId
            })

        case UPDATE_NODE_PROPIERTIES:
            var stateCopy=Object.assign({},state);
            var propierties=Object.getOwnPropertyNames(rest.propierties);
            var idx='0'
            if(rest.id==''){
                idx=lastNodeIndex(stateCopy.elements)
            }else{
                idx=stateCopy.elements.findIndex(elem => elem.id==rest.id)
            }
            for(let prop of propierties){
                stateCopy.elements[idx][prop]=rest.propierties[prop];
            }
            return Object.assign({},state,{
                elements:stateCopy.elements
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

        case SET_NODE_FILE_ID:
            var stateCopy=Object.assign({},state);
            var idx=stateCopy.elements.findIndex(n => n.elementType=='TIME_SERIES')
            stateCopy.elements[idx].params.id=rest.fileId
            return Object.assign({},state, {
                elements: stateCopy.elements,
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

        case FETCH_RUN_PROCESS_REQUEST:
            var processes_status=Object.assign({},state.processes_status)
            processes_status[rest.process['process_id']]='PROCESSING'
            return Object.assign({},state,{
                processes_status: processes_status, //PROCESSING
            })
        
        case FETCH_RUN_PROCESS_RECEIVE:
            var stateCopy=Object.assign({},state);
            
            stateCopy.processes_status[rest.process['process_id']]=rest.process["process_status"]
            
            var idx=stateCopy.elements.findIndex(n => n.id==rest.process["node_output_id"])
            stateCopy.elements[idx].inputData.fetchInput=true
            stateCopy.elements[idx].inputData.inputNodeId=rest.process["node_input_id"] //Ya puedo ir a buscar el resultado
            return Object.assign({},state,{
                processes_status: stateCopy.processes_status, //SUCCESFULL
                elements:stateCopy.elements,
            })

        case FETCH_RUN_PROCESS_FAILURE:
            var processes_status=Object.assign({},state.processes_status)
            processes_status[rest.process['process_id']]=rest.process["process_status"]
            return Object.assign({},state,{
                process_status: processes_status, //FAIL
            })
        
        case FETCH_TIME_SERIES_REQUEST:
            var stateCopy=Object.assign({},state);
            var idx=stateCopy.elements.findIndex(n => n.elementType=='TIME_SERIES')
            stateCopy.elements[idx].dataParams.dataReady=false
            return Object.assign({},state, {
                elements: stateCopy.elements,
            })
        case FETCH_TIME_SERIES_RECEIVE:
            var stateCopy={...state} //Object.assign({},state);
            var idx=stateCopy.elements.findIndex(n => n.elementType=='TIME_SERIES')
            stateCopy.elements[idx].dataParams.data=rest.timeSeries['signal']
            stateCopy.elements[idx].dataParams.sFreq=rest.timeSeries['sampling_freq']
            stateCopy.elements[idx].dataParams.chNames=rest.timeSeries['ch_names']
            stateCopy.elements[idx].dataParams.dataReady=true

            stateCopy.inputsReady.push(stateCopy.elements[idx].id)
            return {
                ...state, 
                elements: stateCopy.elements,
                inputsReady:stateCopy.inputsReady
                }
                
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