import {
    ADD_NODE,
    UPDATE_NODE_PROPIERTIES,
    UPDATE_AFTER_DELETE_ELEMENTS,
    ADD_EDGE,
    CHANGE_EDGE,
    FETCH_RUN_PROCESS_REQUEST,
    FETCH_RUN_PROCESS_RECEIVE,
    FETCH_RUN_PROCESS_FAILURE
} from '../actions/Diagram';

import allowedElements from './_elements';


const initialState={
    elements:[{
        id: '1',
        type: 'input',
        elementType: 'time series',
        sourcePosition:'right',
        data: { label: 'Señal en tiempo' },
        position: { x: 150, y: 50 },
        draggable:false,
        params:null
    },
    {
        id: '2',
        type: 'output',
        elementType: 'time series plot',
        targetPosition:'left',
        data: { label: 'Grafico en tiempo' },
        position: { x: 500, y: 20 },
        draggable:true,
        params:null
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
    lastId: 2
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
            let id='0'
            if(rest.id==''){
                id=lastNodeIndex(copyState.elements)
            }else{
                id=copyState.elements.findIndex(elem => elem.id==rest.id)
            }
            for(let prop of propierties){
                copyState.elements[id][prop]=rest.propierties[prop];
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

        case FETCH_RUN_PROCESS_REQUEST:
            return state
        
        case FETCH_RUN_PROCESS_RECEIVE:
            return state

        case FETCH_RUN_PROCESS_FAILURE:
            return state

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