

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

export const SET_NODE_FILE_ID='SET_NODE_FILE_ID'
export function setNodeFileId(fileId){
    return {
        type:SET_NODE_FILE_ID,
        fileId
    }
}


export const FETCH_RUN_PROCESS_REQUEST='FETCH_RUN_PROCESS_REQUEST'
export function runProcessRequest(process){
    return{
        type:FETCH_RUN_PROCESS_REQUEST,
        process:process
    }
}
export const FETCH_RUN_PROCESS_RECEIVE='FETCH_RUN_PROCESS_RECEIVE'
export function runProcessReceive(process){
    return{
        type:FETCH_RUN_PROCESS_RECEIVE,
        process

    }
}
export const FETCH_RUN_PROCESS_FAILURE='FETCH_RUN_PROCESS_FAILURE'
export function runProcessFailure(json){
    return{
        type:FETCH_RUN_PROCESS_FAILURE,
        process:json
    }
}

export const PROCESS_TO_START='PROCESS_TO_START'
export function processToStart(id){
    return{
        type: PROCESS_TO_START,
        processId:id
    }
}

export const PROCESS_IS_COMPLETED='PROCESS_IS_COMPLETED'
export function processIsCompleted(process){
    return{
        type: PROCESS_IS_COMPLETED,
        process:process
    }
}


export const runProcess= (elements) => async (dispatch) => {

    //CREAR NUMOUTPUT EN EL FOR
    // Poner como primer nodo al input
    let i=0
    let diagram=[]
    let numOutput=0
    let source=null
    let target=null
    let output=null
    let input=null
    let save_output=false
    //SAVE LIST
    const saveList=["MAX_PEAK"]

    for(i;i<elements.length;i++){
        save_output=false
        if(elements[i].elementType==undefined){

            source=diagram.find(n => n.id==elements[i].source)
            source.output.push(elements[i].target)
            
            target=diagram.find(n => n.id==elements[i].target)
            target.input.push(elements[i].source)

        }
        else {
            if(elements[i].type=="output"){
                numOutput+=1
                output=null
            }
            else{
                output=[]
                
            }
            if(elements[i].type=="input"){
                input=null
            }
            else{
                input=[]
            }
            if(saveList.includes(elements[i].elementType)){
                save_output=true
            }
                
            diagram.push({
                id:elements[i].id,
                type:elements[i].type,
                elementType:elements[i].elementType,
                input:input,
                output:output,
                params:elements[i].params,
                processed:elements[i].processParams.processed,
                save_output:save_output,
                return_output:false,
            })

        }
    }
    
    i=0
    let saveOutputList=[]
    let cont=0
    let processes=[]
    let process=[]
    let blacklist=[] //nodo recorridos
    let nodo=null
    let nextNodo=null
    //let auxNodo=null
    let checker = (array,target) => array.every(elem => target.includes(elem)) // revisa si TODOS los elementos en 'array' se encuentran en 'target'
    do{
        nodo=diagram[0] //1
        process.push(nodo) // NODO INICIAL
        
        do{ 

            nextNodo=diagram.find(n => n.id==nodo.output[i]) //voy al output 'i' de nodo

            if(nextNodo.output!=null){
                // VERIFICACION DE NODOS CON OUTPUT>1  ---> FAVLIST
                if(nextNodo.output.length>1 && !saveOutputList.includes(nextNodo.id)){ // me fijo que sea la primera vez que paso por nextNodo
                    nextNodo["save_output"]=true // pongo true para despues guardar la salida cuando procese en el back
                    saveOutputList.push(nextNodo.id) // Lo agrego para no volver a pasar
                }
            }
            

            if (blacklist.includes(nextNodo.id)){   // Verifico que no haya caminado por ahi
                i=i+1 // ya recorri la output 'i' entonces voy al siguiente

                if(checker(nodo.output, blacklist)){ // reviso que no esten todas los outputs en la blacklist
                    blacklist.push(nodo.id) // si tengo todas las salidas ocupadas, guardar en blacklist
                    process.pop()   // me equivoque, lo saco del process
                    nodo=process[process.length-1] // regreso al paso anterior
                    i=0 //reinicio el recorrido de outputs
                }
            }
            else{
                process.push(nextNodo) // guardo en process el step

                if(nextNodo.type=='output'){ // verifico que si llegue al final
                    blacklist.push(nextNodo.id)
                    //Indico que hay que guardar el resultado del anterior en back para pedirlo
                    if (nodo.id!="1")
                        nodo["save_output"]=true
                }

                nodo=nextNodo // me paro en el siguiente
                i=0 // reinicio
            }
            

        }while(nodo.type!='output') // cuando llegue al final de un process, empiezo de nuevo
        processes.push(process)
        process=[]
        cont+=1

    }while(cont!=numOutput) // cuando ya no tengo mas nodos tipo output, termine de recorrer todo el diagrama
    
    //let header= new Headers()
    let url=null
    let initFetch=null
    let process_id=0
    url = API_ROOT+'process/?'
    initFetch={
        method: 'POST',
        body:'',
        headers: {
            'Content-Type': 'application/json'
        },
        };

    
    for(process of processes){
        process_id=process[process.length-1].id
        dispatch(processToStart({'process_id':process_id}))
        initFetch={...initFetch, body:JSON.stringify({"process": process}),}
        if(process.every((n) => n.processed==true)){
            dispatch(processIsCompleted({'process_id':process_id}))
        }
        else{
            dispatch(runProcessRequest({'process_id':process_id}))
            try {
                fetch(url,initFetch)
                .then(res => res.json())
                .then(json => {
                    
                    process=processes.filter(p => {
                        if(p.find(n => n.id==json["output_id"])!=undefined)
                            return true
                        else return false
                    })[0]
                    dispatch(runProcessReceive({
                        'process_status':json["process_status"],
                        'process_result_ids':json["process_result_ids"],
                        'process_id':process_id,
                        'process_node_ids':process.map((node)=> node.id),
                        'node_output_id':process[process.length-1].id,
                        'node_input_id':process[process.length-2].id
                    }))
                    //dispatch(fetchSignal(process[0].params.id))
                    //console.log(process)
                })
            }
            catch (error){
                dispatch(runProcessFailure({
                    'process_id':process_id,
                    'process_status':'FAIL',
                }))
            }
        }
        
        
        cont+=1
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

export const FETCH_SIGNAL_REQUEST = 'FETCH_SIGNAL_REQUEST'
function requestSignal(nodeId, dataType) {
  return {
    type: FETCH_SIGNAL_REQUEST,
    nodeId:nodeId,
    dataType:dataType
  }
}

export const FETCH_SIGNAL_RECEIVE = 'FETCH_SIGNAL_RECEIVE'
function receiveSignal(payload) {
  return {
    type: FETCH_SIGNAL_RECEIVE,
    signalData:payload["signalData"],
    nodeId:payload["nodeId"],
    dataType:payload["dataType"]
    
  }
}

export const FETCH_SIGNAL_FAILURE = 'FETCH_SIGNAL_FAILURE'
function errorFetchingSignal(payload){
    return {
        type: FETCH_SIGNAL_FAILURE,
        error:payload["error"],
        nodeId:payload["nodeId"]
    }
}

/*function selectSignalType(type){
    switch(type){
        case 'TIME_SERIES':
            return 'time_series/?'
        case 'PSD':
            return 'psd/?'
        case 'TIME_FREQUENCY':
            return 'time_frequency/?'
        default:
            return 'time_series/?'
    }
}*/

export const fetchSignal = (id, channels, plotParams, nodeId, dataType) => async (dispatch) => {
    let endpoint=API_ROOT;
    let requestParams;
    switch(dataType){
        case 'TIME_SERIES':
            endpoint=endpoint+'time_series/?'
            requestParams={
                id:id,
                channels: channels==undefined ? '': channels
            }
            break
        case 'PSD':
            endpoint=endpoint+ 'psd/?'
            requestParams={
                id:id,
                time_window:[plotParams.minTimeWindow,plotParams.maxTimeWindow],
                freq_window:[plotParams.minFreqWindow,plotParams.maxFreqWindow],
                channels: channels==undefined ? '': channels,
                type: plotParams["type"]==undefined ? '': plotParams["type"]
            }
            if(plotParams["type"]=='welch'){
                requestParams["n_fft"]=plotParams["n_fft"] == undefined ? '': plotParams["n_fft"]
                requestParams["n_per_seg"]=plotParams["n_per_seg"] == undefined ? '': plotParams["n_per_seg"]
                requestParams["n_overlap"]=plotParams["n_overlap"]== undefined ? '': plotParams["n_overlap"]
                requestParams["window"]=plotParams["window"]== undefined ? '': plotParams["window"]
                requestParams["average"]=plotParams["average"]== undefined ? '': plotParams["average"]
            }else{
                requestParams["bandwidth"]=plotParams["bandwidth"]== undefined ? '': plotParams["bandwidth"]
                requestParams["adaptive"]=plotParams["adaptive"]== undefined ? '': plotParams["adaptive"]
                requestParams["normalization"]=plotParams["normalization"]== undefined ? '': plotParams["normalization"]
                requestParams["low_bias"]=plotParams["low_bias"]== undefined ? '': plotParams["low_bias"]
            }
            

            break
        case 'TIME_FREQUENCY':
            endpoint=endpoint+ 'time_frequency/?'
            break
        default:
            endpoint=endpoint+ 'time_series/?'
            requestParams={
                id:id,
                channels: channels==undefined ? '': channels
            }
            break
    }


    let url = endpoint + new URLSearchParams(requestParams)
    
    let header= new Headers()
    var initFetch={
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      };

    dispatch(requestSignal(nodeId,dataType))
    try {
        //await fetcher(url,initFetch)
        await fetch(url,initFetch)
        .then(res => res.json())
        .then(signalData => dispatch(receiveSignal({signalData, 'nodeId':nodeId, 'dataType':dataType})))
    }
    catch (error){
        dispatch(errorFetchingSignal({error, 'nodeId':nodeId}))
    }
    
}

export const DELETE_ITEM_INPUTS_READY='DELETE_ITEM_INPUTS_READY'
export function deleteItemInputsReady(id){
    return{
        type:DELETE_ITEM_INPUTS_READY,
        id:id
    }
}