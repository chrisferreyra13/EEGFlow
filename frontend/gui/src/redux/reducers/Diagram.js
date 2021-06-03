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
    FETCH_SIGNAL_REQUEST,
    FETCH_SIGNAL_RECEIVE,
    FETCH_SIGNAL_FAILURE,
    SET_NODE_FILE_ID,
    PROCESS_IS_COMPLETED,
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
            id:'40',
        },
        dataParams:{
            dataReady:false,
            data: [],
            sFreq: 0,
            chNames: [],
            
        },
        processParams:{
            precessed:false,
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
            channels:'EEG 016,EEG 017',
            minTimeWindow:null,
            maxTimeWindow:null,
            largeSize:'on',
            mediumSize:'off',
            smallSize:'off',
        },
        processParams:{
            precessed:false,
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
    let elements;
    let processes_status;
    let inputsReady;
    let processed;
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
            elements={}
            elements=state.elements.map((item) => {
                if (item.elementType == 'TIME_SERIES'){
                    return {
                        ...item,
                        params:{
                            //...item.params,
                            id:rest.fileId,
                        }
                      }

                }else{
                    return item
                }
                  
            })
            return Object.assign({},state, {
                elements: elements,
            })

        case PROCESSES_TO_START:
            let i=0
            processes_status=[]
            for(i;i<rest.numberOfProcesses;i++){
                processes_status.push('TOSTART')
            }
            return Object.assign({},state,{
                processes_status: processes_status, //PROCESSING
            })
        
        case PROCESS_IS_COMPLETED:
            processes_status=[]
            processes_status=JSON.parse(JSON.stringify(state.processes_status))
            processes_status[rest.process['process_id']]='SUCCESFULL'
            return Object.assign({},state,{
                processes_status: processes_status, //PROCESSING
            })

        case FETCH_RUN_PROCESS_REQUEST:
            processes_status=[]
            processes_status=JSON.parse(JSON.stringify(state.processes_status))
            processes_status[rest.process['process_id']]='PROCESSING'
            return Object.assign({},state,{
                processes_status: processes_status, //PROCESSING
            })
        
        case FETCH_RUN_PROCESS_RECEIVE:
            elements={}
            processed=false
            elements=state.elements.map((item) => {
                if(rest.process["process_node_ids"].includes(item.id)){processed=true}
                else{processed=false}

                if(rest.process["process_result_ids"].hasOwnProperty(item.id)){
                    return {
                        ...item,
                        params:{
                            ...item.params,
                            id:rest.process["process_result_ids"][item.id]
                        },
                        processParams:{
                            processed:processed
                        }
                    }
                }
                if (item.id==rest.process["node_output_id"]){
                    return {
                        ...item,
                        inputData:{
                            fetchInput:true,
                            inputNodeId:rest.process["node_input_id"], //Ya puedo ir a buscar el resultado
                        },
                        processParams:{
                            processed:processed
                        }
                    }
                }else{
                    return {
                        ...item,
                        processParams:{
                            processed:processed
                        }
                    }
                }
            })
            // Seteo process en SUCCESFULL
            processes_status=[]
            processes_status=JSON.parse(JSON.stringify(state.processes_status))
            processes_status[rest.process['process_id']]=rest.process["process_status"]
             
            return Object.assign({},state,{
                processes_status: processes_status, //SUCCESFULL
                elements:elements,
            })

        case FETCH_RUN_PROCESS_FAILURE:
            processes_status=[]
            processes_status=JSON.parse(JSON.stringify(state.processes_status))
            processes_status[rest.process['process_id']]=rest.process["process_status"]
            return Object.assign({},state,{
                process_status: processes_status, //FAIL
            })
        
        case FETCH_SIGNAL_REQUEST:
            elements=state.elements.map((item) => {
                if (item.id == rest.nodeId) {
                    return {
                        ...item,
                        dataParams:{
                            dataReady:false,
                        }
                    }
                }else{
                    return item
                }
            })

            return Object.assign({},state,{
                elements: elements,
                })

        case FETCH_SIGNAL_RECEIVE:
            inputsReady=JSON.parse(JSON.stringify(state.inputsReady))
            let nodesWithData=[]

            elements=state.elements.map((item) => {
                if(item.dataParams!=undefined)
                    if(item.dataParams.dataReady==true){nodesWithData.push(item.id)}

                if (item.id == rest.nodeId) {
                    inputsReady.push(item.id)
                    nodesWithData.push(item.id)
                    return {
                        ...item,
                        dataParams:{
                            data:rest.signalData['signal'],
                            sFreq:rest.signalData['sampling_freq'],
                            chNames:rest.signalData['ch_names'],
                            dataReady:true,
                        }
                    }
                }
                else{
                    return item
                } 
            })
            
            inputsReady=inputsReady.filter((nodeId) => { // elimino si quedo uno viejo
                if(nodesWithData.includes(nodeId)){return true}
                else {return false}
            })
            inputsReady=[...new Set(inputsReady)] //elimino las copias

            return Object.assign({},state,{
                elements: elements,
                inputsReady:inputsReady
                })
                
        case FETCH_SIGNAL_FAILURE:
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

function updateObjectInArray(array, action) {
    return array.map((item, index) => {
      if (index !== action.index) {
        // This isn't the item we care about - keep it as-is
        return item
      }
  
      // Otherwise, this is the one we want - return an updated value
      return {
        ...item,
        ...action.item
      }
    })
  }