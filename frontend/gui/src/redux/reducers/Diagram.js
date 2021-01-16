import {
    ADD_NODE,
    UPDATE_NODE_PROPIERTIES,
    DELETE_NODE,
} from '../actions/Diagram';

import allowedElements from './_elements';


const initialState={
    elements:[{
        id: '1',
        type: 'input',
        sourcePosition:'right',
        data: { label: 'Señal en tiempo' },
        position: { x: 250, y: 5 },
      },
    ],
    idCount: 1
}

export const diagram= (state=initialState, {type, ...rest})=>{
    switch(type){
        case ADD_NODE:
            var newState=state;
            newState.idCount=state.idCount+1;
            newState.elements[newState.idCount-1]=allowedElements.find(element => element.type===rest.nodeType);
            newState.elements[newState.idCount-1].id=newState.idCount.toString();
            return newState

        case UPDATE_NODE_PROPIERTIES:
            var newState=state
            newState.elements[newState.idCount-1].position=rest.propierties.position;
            return newState

        case DELETE_NODE:
            console.log('hola')
            const hola=state.elements.filter(function(element){
                console.log(element.id)
                console.log(rest.nodesIds)
                return rest.nodesIds.includes(element.id)
            })
            console.log(hola)
            return Object.assign({}.state,{
                elements: state.elements.filter(function(element){
                    console.log(element.id)
                    console.log(rest.nodesIds)
                    return rest.nodesIds.includes(element.id)
                }),
                idCount:state.idCount-rest.nodesIds.length
            })
            
        default:
            return state
    }
}
