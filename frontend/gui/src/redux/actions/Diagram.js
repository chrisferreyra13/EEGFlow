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
    var diagram=[
        {
            id:'1',
            type:'input',
            elementType:'TIME_SERIES',
            input:null,
            output:['2'],
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'2',
            type:'output',
            elementType:'PLOT_TIME_SERIES',
            input:['1'],
            output:null,
            params:null,
            save_output:'false',
            return_output:'false',

        },

    ]

    //CREAR NUMOUTPUT EN EL FOR
    // Poner como primer nodo al input
    let numOutput=1
    /*for(i;i<elements.length;i++){
        if(elements[i].elementType==undefined){
            diagram.push({
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
    }*/

    var url = API_ROOT+'check_process/?' + new URLSearchParams({
        diagram: diagram,
      })
      
    var header= new Headers()
    var initFetch={
    method: 'GET',
    headers: header,
    mode: 'cors',
    cache: 'default'
    };

    i=0
    let firstime=true
    let count=0
    let processes=[]
    let process=[]
    let favlist=[] // nodos con multiple output
    let blacklist=[] //caminos recorridos
    let nodo=null
    let nextNodo=null
    {
        process.push(diagram[0]) // NODO INICIAL
        nodo=diagram[0] //1
        {
            //nodo=3
            if(blacklist.includes(nodo.output)){    // Todos los outputs
                blacklist.push(nodo.id)
                nodo=diagram.find(n=> n.id==favlist[favlist.findIndex(nd=>nd==nodo.id)-1])  //Buscar en la favlist en id del nodo anterior al 'nodo'
                //process.delete.last //Eliminar el ultimo agregado a process porque nos equivocamos
                
            } //nodo=2

            {i=i+1}while(blacklist.includes(nodo.output[i]))    //i=1

            nextNodo=diagram.find(n => n.id==nodo.output[i]) //4
            process.push(nextNodo)//4

            if(nextNodo.output.length>1 && firstime==true)
                favlist.push(nextNodo.id) //NUNCA MAS

            if(nextNodo.type=='output')
                blacklist.push(nextNodo.id)//4

            if(i>=nodo.output.length-1 && nodo.id!='1') // Si ya recorri todos los outputs
                blacklist.push(nodo.id)//2
            
            nodo=nextNodo //4
            i=0

        }while(nodo.type=='output')//4
        processes.push(process)
        firstime=false
        process=[]
        count+=1
    }while(count==numOutput)

    dispatch(runProcessRequest())
    try {
        fetch(url,initFetch)
        .then(res => res.json())
        .then(json => {
            dispatch(runProcessReceive(json))
            
        
        })
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
