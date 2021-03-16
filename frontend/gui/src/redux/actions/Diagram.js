const API_ROOT= 'http://127.0.0.1:8000/eeg/'

export const ADD_NODE='ADD_NODE'
export function addNode(elementType){
    return{
        type:ADD_NODE,
        elementType
    }
}

export const ADD_EDGE='ADD_EDGE'
export function addNewEdge(newElements){
    return{
        type:ADD_EDGE,
        newElements
    }
}

export const CHANGE_EDGE='CHANGE_EDGE'
export function changeEdge(newElements){
    return{
        type:CHANGE_EDGE,
        newElements
    }
}

export const UPDATE_NODE_PROPIERTIES='UPDATE_NODE_PROPIERTIES'
export function updateNodePropierties(id,propierties){
    return{
        type:UPDATE_NODE_PROPIERTIES,
        id:id,
        propierties:propierties
    }
}

export const UPDATE_AFTER_DELETE_ELEMENTS='UPDATE_AFTER_DELETE_ELEMENTS'
export function updateAfterDeleteElements(newElements, numOfNodesRemoved){
    return{
        type:UPDATE_AFTER_DELETE_ELEMENTS,
        newElements,
        numOfNodesRemoved
    }
}

export const FETCH_RUN_PROCESS_REQUEST='FETCH_RUN_PROCESS_REQUEST'
export function runProcessRequest(){
    return{
        type:FETCH_RUN_PROCESS_REQUEST,
    }
}
export const FETCH_RUN_PROCESS_RECEIVE='FETCH_RUN_PROCESS_RECEIVE'
export function runProcessReceive(){
    return{
        type:FETCH_RUN_PROCESS_RECEIVE,
    }
}
export const FETCH_RUN_PROCESS_FAILURE='FETCH_RUN_PROCESS_FAILURE'
export function runProcessFailure(){
    return{
        type:FETCH_RUN_PROCESS_FAILURE,
    }
}

export const runProcess= (elements) => async (dispatch) => {
    var i=0
    var flux=[]
    var nodes=[]
    for(i;i<elements.length;i++){
        if(elements[i].elementType==undefined){
            flux.push({
                source:elements[i].source,
                target:elements[i].target
            })
        }
        else {
            nodes.push({
                id:elements[i].id,
                type: elements[i].elementType,
                params:elements[i].params
            })
        }
    }
    console.log(flux)
    console.log(nodes)
    const sequence={
        nodes:nodes,
        flux:flux
    }

    var url = API_ROOT+'process/?' + new URLSearchParams({
        sequence: sequence,
      })
      
    var header= new Headers()
    var initFetch={
    method: 'GET',
    headers: header,
    mode: 'cors',
    cache: 'default'
    };

    dispatch(runProcessRequest())
    try {
        fetch(url,initFetch)
        .then(res => res.json())
        .then(json => dispatch(runProcessReceive(json)))
    }
    catch (error){
        dispatch(runProcessFailure(error))
    }
}

export const FETCH_CANCEL_PROCESS_REQUEST='FETCH_CANCEL_PROCESS_REQUEST'
export function cancelProcessRequest(){
    return{
        type:FETCH_CANCEL_PROCESS_REQUEST,
    }
}
export const FETCH_CANCEL_PROCESS_RECEIVE='FETCH_CANCEL_PROCESS_RECEIVE'
export function cancelProcessReceive(){
    return{
        type:FETCH_CANCEL_PROCESS_RECEIVE,
    }
}
export const FETCH_CANCEL_PROCESS_FAILURE='FETCH_CANCEL_PROCESS_FAILURE'
export function cancelProcessFailure(){
    return{
        FETCH_CANCEL_PROCESS_FAILURE
    }
}


export const cancelProcess= () => async (dispatch) => {
    console.log('click on cancel button')
    var url = API_ROOT+'process/?' + new URLSearchParams({
        action: 'cancel',
    })
      
    var header= new Headers()
    var initFetch={
    method: 'GET',
    headers: header,
    mode: 'cors',
    cache: 'default'
    };

    dispatch(runProcessRequest())
    try {
        fetch(url,initFetch)
        .then(res => res.json())
        .then(json => dispatch(runProcessReceive(json)))
    }
    catch (error){
        dispatch(runProcessFailure(error))
    }
}

export const FETCH_SINGLE_PROCESS_REQUEST='FETCH_SINGLE_PROCESS_REQUEST'
export function singleProcessRequest(){
    return{
        type:FETCH_SINGLE_PROCESS_REQUEST,
    }
}
export const FETCH_SINGLE_PROCESS_RECEIVE='FETCH_SINGLE_PROCESS_RECEIVE'
export function singleProcessReceive(){
    return{
        type:FETCH_SINGLE_PROCESS_RECEIVE,
    }
}
export const FETCH_SINGLE_PROCESS_FAILURE='FETCH_SINGLE_PROCESS_FAILURE'
export function singleProcessFailure(){
    return{
        FETCH_SINGLE_PROCESS_FAILURE
    }
}

export const runSingleProcess= (params) => async (dispatch) => {
    console.log('singleProcess with this params:',params)
    var url = API_ROOT+'process/?' + new URLSearchParams({
        params: params,
    })
      
    var header= new Headers()
    var initFetch={
    method: 'GET',
    headers: header,
    mode: 'cors',
    cache: 'default'
    };

    dispatch(singleProcessRequest())
    try {
        fetch(url,initFetch)
        .then(res => res.json())
        .then(json => dispatch(singleProcessReceive(json)))
    }
    catch (error){
        dispatch(singleProcessFailure(error))
    }
}
