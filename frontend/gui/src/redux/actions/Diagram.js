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
export function runProcessRequest(json){
    return{
        type:FETCH_RUN_PROCESS_REQUEST,
        process:json
    }
}
export const FETCH_RUN_PROCESS_RECEIVE='FETCH_RUN_PROCESS_RECEIVE'
export function runProcessReceive(json){
    return{
        type:FETCH_RUN_PROCESS_RECEIVE,
        process:json

    }
}
export const FETCH_RUN_PROCESS_FAILURE='FETCH_RUN_PROCESS_FAILURE'
export function runProcessFailure(json){
    return{
        type:FETCH_RUN_PROCESS_FAILURE,
        process:json
    }
}

export const PROCESSES_TO_START='PROCESSES_TO_START'
export function processesToStart(len){
    return{
        type: PROCESSES_TO_START,
        numberOfProcesses:len
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
    for(i;i<elements.length;i++){
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
            
                
            diagram.push({
                id:elements[i].id,
                type:elements[i].type,
                elementType:elements[i].elementType,
                input:input,
                output:output,
                params:elements[i].params,
                processed:false,
                save_output:false,
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

                if(nextNodo.type=='output') // verifico que si llegue al final
                    blacklist.push(nextNodo.id)
                    //Indico que hay que guardar el resultado del anterior en back para pedirlo
                    nodo["save_output"]=true

                nodo=nextNodo // me paro en el siguiente
                i=0 // reinicio
            }
            

        }while(nodo.type!='output') // cuando llegue al final de un process, empiezo de nuevo
        processes.push(process)
        process=[]
        cont+=1

    }while(cont!=numOutput) // cuando ya no tengo mas nodos tipo output, termine de recorrer todo el diagrama

    console.log(processes)
    
    //let header= new Headers()
    let url=null
    let initFetch=null
    cont=0
    dispatch(processesToStart(processes.length))
    for(process of processes){
        url = API_ROOT+'process/?'
          
        initFetch={
        method: 'POST',
        body:JSON.stringify({"process": process}),
        headers: {
            'Content-Type': 'application/json'
        },
        };
    
        
        dispatch(runProcessRequest({'process_id':cont}))
        try {
            fetch(url,initFetch)
            .then(res => res.json())
            .then(json => {
                dispatch(runProcessReceive(Object.assign({},json,{'process_id':cont,'node_output_id':process[process.length-1].id})))
                process.forEach(node =>{
                    node["processed"]=true
                })
                console.log(process)
            })
        }
        catch (error){
            dispatch(runProcessFailure(error))
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
