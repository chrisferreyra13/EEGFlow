import {
    ADD_NODE,
    UPDATE_NODE_PROPIERTIES,
    UPDATE_AFTER_DELETE_ELEMENTS,
    ADD_EDGE,
    CHANGE_EDGE,
    FETCH_RUN_PROCESS_REQUEST,
    FETCH_RUN_PROCESS_RECEIVE,
    FETCH_RUN_PROCESS_FAILURE,
    PROCESS_TO_START,
    FETCH_SIGNAL_REQUEST,
    FETCH_SIGNAL_RECEIVE,
    FETCH_SIGNAL_FAILURE,
    FETCH_METHOD_RESULT_REQUEST,
    FETCH_METHOD_RESULT_RECEIVE,
    FETCH_METHOD_RESULT_FAILURE,
    SET_NODE_FILE_ID,
    PROCESS_IS_COMPLETED,
    DELETE_ITEM_INPUTS_READY,
} from '../actions/Diagram';
import allowedElements from './_elements';

import {v4 as uuidv4} from 'uuid';
import { element } from 'prop-types';

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
        signalsData:[],
        processParams:{
            processed:false,
        },
    },
    {
        id: '2',
        type: 'output',
        elementType: 'PLOT_TIME_SERIES',
        formType:'ENABLE_PLOT_TIME_SERIES_FORM',
        targetPosition:'left',
        data: { label: 'Grafico en tiempo' },
        //style: { borderColor: '#2eb85c', boxShadow: '0px 0px 0.5px #2eb85c' },
        position: { x: 500, y: 20 },
        draggable:true,
        inputData:{
            fetchInput:true,
            inputNodeId:'1',
        },
        params:{
            channels:['EEG 001','EEG 002'],
            minXWindow:null,
            maxXWindow:null,
            size:'l',
        },
        processParams:{
            processed:false,
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
    processes_status:{}, //[TOSTART, PROCESSING, SUCCESFULL, FAIL]
    inputsReady:[]
}

export const diagram= (state=initialState, {type, ...rest})=>{
    let propierties;
    let elements;
    let processes_status;
    let inputsReady;
    let processed;
    let newSignalsData;
    let newSignalData;
    let signalData;
    let index;
    let exists;
    switch(type){
        case ADD_NODE: 
            
            //Get the new elem from allowed elements
            let newElement=JSON.parse(JSON.stringify(allowedElements.find(element => element.elementType===rest.elementType)))
            //Get the last node index (the list has nodes and edges)
            let nodeIdx=lastNodeIndex(state.elements)
            let lastId=parseInt(JSON.parse(JSON.stringify(state.elements[nodeIdx].id)))+1;
            // Assign new id for the new element
            newElement.id=(lastId).toString();

            //update position to be more spread
            let position=JSON.parse(JSON.stringify(state.elements[nodeIdx].position))
            newElement.position={
                x: position.x+250,
                y: position.y+100
            }                            
            return Object.assign({},state,{
                elements: [...state.elements, newElement],
                nodesCount: state.nodesCount+1,
                lastId: lastId
            })

        case UPDATE_NODE_PROPIERTIES:
            //var stateCopy=Object.assign({},state);
            //let paramsChange=false;
            let notJustSize=false; //Con este flag se verifica si hubo un cambio mas ademas del size
            //let sizeFlag=false
            //let createProps=true;
            let newPropierties={};
            propierties=Object.getOwnPropertyNames(rest.propierties);
            var idx='0'
            if(rest.id==''){ //cuando cargo el nodo por primera vez
                idx=lastNodeIndex(state.elements)
            }else{
                idx=state.elements.findIndex(elem => elem.id==rest.id)
            }
            elements=state.elements.map((item,j) => {
                if(j!=parseInt(idx)) return item
                    
                else{
                    newPropierties["params"]=JSON.parse(JSON.stringify(item['params']))
                    newPropierties['position']=JSON.parse(JSON.stringify(item['position']));
                    for(let prop of propierties){
                        if(prop=='position'){
                            newPropierties[prop]=JSON.parse(JSON.stringify(rest.propierties[prop]));
                        }else{
                            newPropierties['params'][prop]=JSON.parse(JSON.stringify(rest.propierties[prop]));

                            if(prop!='size' && item['params'][prop]!=rest.propierties[prop]) notJustSize=true
                        }
                    }
                    
                    if(notJustSize){
                        return {
                            ...item,
                            position:newPropierties.position,
                            params:newPropierties.params,
                            processParams:{
                                ...item.processParams,
                                processed:false
                            }
                        }
                    }else{
                        return {
                            ...item,
                            params:newPropierties.params,
                            position:newPropierties.position,
                    
                        }
                    }


                }
            })
            
            return Object.assign({},state,{
                elements:elements
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
            elements=unpurge(state.elements,rest.newElements)
            return Object.assign({},state,{
                elements: elements,
                nodesCount:state.nodesCount-rest.numOfNodesRemoved
            })
        
        case ADD_EDGE:
            elements=unpurge(state.elements,rest.newElements)
            return Object.assign({},state,{
                elements: elements,
                })
  
        case CHANGE_EDGE:
            elements=unpurge(state.elements,rest.newElements)
            return Object.assign({},state,{
                elements: elements,
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

        case PROCESS_TO_START:
            let i=0
            processes_status={}
            processes_status=JSON.parse(JSON.stringify(state.processes_status))
            processes_status[rest['processId']]='TOSTART'
            
            return Object.assign({},state,{
                processes_status: processes_status, //PROCESSING
            })
        
        case PROCESS_IS_COMPLETED:
            processes_status={}
            processes_status=JSON.parse(JSON.stringify(state.processes_status))
            processes_status[rest.process['process_id']]='SUCCESFULL'
            return Object.assign({},state,{
                processes_status: processes_status, //SUCCESFULL
            })

        case FETCH_RUN_PROCESS_REQUEST:
            processes_status={}
            processes_status=JSON.parse(JSON.stringify(state.processes_status))
            processes_status[rest.process['process_id']]='PROCESSING'
            elements={}
            elements=state.elements.map((item) => {
                if(item.id==rest.process["process_output_id"]){
                    return {
                        ...item,
                        style: null,
                    }
                }
                return item
            })
            return Object.assign({},state,{
                processes_status: processes_status, //PROCESSING
                elements:elements
            })
        
        case FETCH_RUN_PROCESS_RECEIVE:
            elements={}
            processed=false
            elements=state.elements.map((item) => {
                if(item.processParams!=undefined)
                    processed=item.processParams.processed
                if(rest.process["process_node_ids"].includes(item.id)){processed=true}

                if(rest.process["process_result_ids"]!=undefined){
                    if(rest.process["process_result_ids"].hasOwnProperty(item.id)){
                        return {
                            ...item,
                            params:{
                                ...item.params,
                                id:rest.process["process_result_ids"][item.id]
                            },
                            processParams:{
                                ...item.processParams,
                                processed:processed
                            }
                        }
                    }
                }/*else{
                    return {
                        ...item,
                        processParams:{
                            processed:processed
                        }
                    }
                }*/
                
                if (item.id==rest.process["node_output_id"]){
                    return {
                        ...item,
                        style: { borderColor: '#2eb85c', boxShadow: '0px 0px 0.5px #2eb85c' },
                        inputData:{
                            fetchInput:true,
                            inputNodeId:rest.process["node_input_id"], //Ya puedo ir a buscar el resultado
                            
                        },
                        processParams:{
                            ...item.processParams,
                            processed:processed,
                            processId: rest.process["process_id"]
                        }
                    }
                }else{
                    return {
                        ...item,
                        processParams:{
                            ...item.processParams,
                            processed:processed
                        }
                    }
                }
            })
            // Seteo process en SUCCESFULL
            processes_status={}
            processes_status=JSON.parse(JSON.stringify(state.processes_status))
            processes_status[rest.process['process_id']]=rest.process["process_status"]
             
            return Object.assign({},state,{
                processes_status: processes_status, //SUCCESFULL
                elements:elements,
            })

        case FETCH_RUN_PROCESS_FAILURE:
            processes_status={}
            processes_status=JSON.parse(JSON.stringify(state.processes_status))
            processes_status[rest.process['process_id']]=rest.process["process_status"]
            return Object.assign({},state,{
                process_status: processes_status, //FAIL
            })
        
        case FETCH_SIGNAL_REQUEST:
            inputsReady=JSON.parse(JSON.stringify(state.inputsReady))
            index=0;
            newSignalsData=[]
            signalData={}
            elements=state.elements.map((item) => {
                if(item.signalsData!=undefined && item.signalsData.length!=0)
                    signalData=item.signalsData.find(d => d.dataType==rest.dataType)
                    if(signalData!=undefined){
                        if(signalData.dataReady==false){
                            index=inputsReady.findIndex(id => id==signalData.id)
                            if(index!=-1){
                                inputsReady.splice(index,1)
                            }
                        }
                    }

                if (item.id == rest.nodeId) {
                    if(item.signalsData.length==0){
                        newSignalsData.push({dataType:rest.dataType,dataReady:false})
                    }
                    else{
                        newSignalsData=item.signalsData.map(d => {
                            if(d.dataType==rest.dataType){
                                d.dataReady=false
                            }
                            return d
                        })
                    }
                    return {
                        ...item,
                        signalsData:newSignalsData,
                    }
                }else{
                    return item
                }
            })
            /*
            inputsReady=inputsReady.filter((nodeId) => { // elimino si quedo uno viejo
                if(nodesWithData.includes(nodeId)){return true}
                else {return false}
            })
            inputsReady=[...new Set(inputsReady)] //elimino las copias
            */

            return Object.assign({},state,{
                elements: elements,
                inputsReady:inputsReady
                })

        case FETCH_SIGNAL_RECEIVE:
            inputsReady=JSON.parse(JSON.stringify(state.inputsReady))
            exists=false
            newSignalsData=[]
            newSignalData={
                id:uuidv4(),
                data:rest.signalData['signal'],
                dataType:rest.dataType,
                sFreq:rest.signalData['sampling_freq'],
                chNames:rest.signalData['ch_names'],
                processId:rest.processId,
                dataReady:true,
            }
            if(rest.signalData["freqs"]!=undefined){
                newSignalData['freqs']=rest.signalData['freqs']
            }
            
            elements=state.elements.map((item) => {
                if (item.id == rest.nodeId){
                    /*if(item.signalsData.length==0){
                        inputsReady.push(newSignalData.id)
                        item.signalsData.push(newSignalData)
                    }*/
                    //else
                    //Reviso si existe el signalData
                    newSignalsData=item.signalsData.map(d => { 
                        if(d.dataType==rest.dataType){
                            inputsReady.push(newSignalData.id)
                            d=newSignalData
                            exists=true
                        }
                        return d
                    })
                    //si no existe, lo agrego
                    if(!exists){
                        inputsReady.push(newSignalData.id)
                        newSignalsData.push(newSignalData)
                    }
                    
                    return {
                        ...item,
                        signalsData:newSignalsData
                    }
                }
                else{
                    return item
                } 
            })

            return Object.assign({},state,{
                elements: elements,
                inputsReady:inputsReady
                })
                
        case FETCH_SIGNAL_FAILURE:
            return {...state, ...rest}

        case FETCH_METHOD_RESULT_REQUEST:
            inputsReady=JSON.parse(JSON.stringify(state.inputsReady))
            index=0;
            newSignalsData=[]
            elements=state.elements.map((item) => {
                if(item.signalsData!=undefined && item.signalsData.length!=0)
                    signalData=item.signalsData.find(d => d.dataType==rest.dataType)
                    if(signalData!=undefined){
                        if(signalData.dataReady==false){
                            index=inputsReady.findIndex(id => id==signalData.id)
                            if(index!=-1){
                                inputsReady.splice(index,1)
                            }
                        }
                    }
                

                if (item.id == rest.nodeId) {
                    if(item.signalsData.length==0){
                        newSignalsData.push({dataType:rest.dataType,dataReady:false})
                    }
                    else{
                        newSignalsData=item.signalsData.map(d => {
                            if(d.dataType==rest.dataType){
                                d.dataReady=false
                            }
                            return d
                        })
                    }
                    return {
                        ...item,
                        signalsData:newSignalsData,
                    }
                }else{
                    return item
                }
            })

            return Object.assign({},state,{
                elements: elements,
                inputsReady:inputsReady
                })

        case FETCH_METHOD_RESULT_RECEIVE:
            inputsReady=JSON.parse(JSON.stringify(state.inputsReady))
            exists=false
            newSignalsData=[]
            newSignalData={
                id:uuidv4(),
                data:rest.methodResult['data'],
                chNames:rest.methodResult['ch_names'],
                dataType:rest.dataType,
                dataReady:true,
            }
            
            elements=state.elements.map((item) => {
                if (item.id == rest.nodeId){
                    /*if(item.signalsData.length==0){
                        inputsReady.push(newSignalData.id)
                        item.signalsData.push(newSignalData)
                    }*/
                    //else
                    newSignalsData=item.signalsData.map(d => { 
                        if(d.dataType==rest.dataType){
                            inputsReady.push(newSignalData.id)
                            d=newSignalData
                            exists=true
                        }
                        return d
                    })
                    if(!exists){
                        inputsReady.push(newSignalData.id)
                        newSignalsData.push(newSignalData)
                    }
                    
                    return {
                        ...item,
                        signalsData:newSignalsData
                    }
                }
                else{
                    return item
                } 
            })

            return Object.assign({},state,{
                elements: elements,
                inputsReady:inputsReady
                })
                
        case FETCH_METHOD_RESULT_FAILURE:
            return {...state, ...rest}
        
        case DELETE_ITEM_INPUTS_READY:
            inputsReady=JSON.parse(JSON.stringify(state.inputsReady))
            return Object.assign({}, state, {
                inputsReady:inputsReady.filter(id => id!=rest.id)
            })

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

function unpurge(stateElements,newElements){
    let elements=newElements.map((item) => {
        if(item.signalsData!=undefined){
            return {
                ...item,
                signalsData:stateElements.find((n) => n.id==item.id).signalsData
            }
        }else{
            return item
        }
        
    })

    return elements
}
