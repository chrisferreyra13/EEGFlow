import {
    ADD_NODE,
    UPDATE_NODE_PROPIERTIES,
    UPDATE_AFTER_DELETE_ELEMENTS,
    ADD_EDGE,
    CHANGE_EDGE
} from '../actions/Diagram';

import allowedElements from './_elements';


const initialState={
    elements:[{
        id: '1',
        type: 'input',
        elementType: 'time series',
        sourcePosition:'right',
        data: { label: 'Señal en tiempo' },
        position: { x: 250, y: 5 },
        draggable:false
        },
    ],
    nodesCount: 1,
    lastId: 1
}

export const diagram= (state=initialState, {type, ...rest})=>{
    switch(type){
        case ADD_NODE: //TODO: NO ES ROBUSTO USAR NODECOUNT
            var copyState=Object.assign({},state);
            var nodeIndex=lastNodeIndex(copyState.elements,copyState.lastId)
            copyState.elements.push(Object.assign({},allowedElements.find(element => element.elementType===rest.elementType)));
            copyState.lastId=copyState.lastId+1
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
            copyState.elements[lastNodeIndex(copyState.elements,copyState.lastId)].position=rest.propierties.position;
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

        default:
            return state
    }
}

const lastNodeIndex = (elements, lastId) => {
    return elements.findIndex((element)=> element.id===lastId.toString())
}