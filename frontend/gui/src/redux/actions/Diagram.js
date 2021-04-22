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

    /*let diagram=[
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
            type:'default',
            elementType:'BETA',
            input:['1'],
            output:['3','4'],
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'3',
            type:'default',
            elementType:'MAX_PEAK',
            input:['2'],
            output:['5','6','7'],
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'4',
            type:'output',
            elementType:'PLOT_TIME_SERIES',
            input:['2'],
            output:null,
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'5',
            type:'default',
            elementType:'CUSTOM_FILTER',
            input:['3'],
            output:['8','9'],
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'6',
            type:'output',
            elementType:'PLOT_FOURIER',
            input:['3'],
            output:null,
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'7',
            type:'output',
            elementType:'PLOT_TIME_SERIES',
            input:['3'],
            output:null,
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'8',
            type:'default',
            elementType:'ALPHA',
            input:['5'],
            output:['10','11'],
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'10',
            type:'output',
            elementType:'PLOT_TIME_SERIES',
            input:['8'],
            output:null,
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'11',
            type:'output',
            elementType:'PLOT_FOURIER',
            input:['8'],
            output:null,
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'9',
            type:'default',
            elementType:'MAX_PEAK',
            input:['5'],
            output:['12','13','14'],
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'12',
            type:'output',
            elementType:'PLOT_FOURIER',
            input:['5'],
            output:null,
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'13',
            type:'output',
            elementType:'PLOT_TIME_SERIES',
            input:['5'],
            output:null,
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'14',
            type:'default',
            elementType:'MAX_PEAK',
            input:['9'],
            output:['15'],
            params:null,
            save_output:'false',
            return_output:'false',

        },
        {
            id:'15',
            type:'output',
            elementType:'PLOT_TIME_SERIES',
            input:['14'],
            output:null,
            params:null,
            save_output:'false',
            return_output:'false',

        },
        

    ]*/

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
                save_output:'false',
                return_output:'false',
            })

        }
    }

    /*  ESTA SECCION VAAAAAAAA
    var url = API_ROOT+'check_process/?' + new URLSearchParams({
        diagram: diagram,
      })
      
    var header= new Headers()
    var initFetch={
    method: 'GET',
    headers: header,
    mode: 'cors',
    cache: 'default'
    };*/
    
    i=0
    
    let count=0
    let processes=[]
    let process=[]
    let blacklist=[] //nodo recorridos
    let nodo=null
    let nextNodo=null
    let checker = (array,target) => array.every(elem => target.includes(elem)) // revisa si TODOS los elementos en 'array' se encuentran en 'target'
    do{
        nodo=diagram[0] //1
        process.push(nodo) // NODO INICIAL
        
        do{ 

            nextNodo=diagram.find(n => n.id==nodo.output[i]) //voy al output 'i' de nodo

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

                nodo=nextNodo // me paro en el siguiente
                i=0 // reinicio
            }
            

        }while(nodo.type!='output') // cuando llegue al final de un process, empiezo de nuevo
        processes.push(process)
        process=[]
        count+=1

    }while(count!=numOutput) // cuando ya no tengo mas nodos tipo output, termine de recorrer todo el diagrama

    console.log(processes)
    /*
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
    }*/
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
