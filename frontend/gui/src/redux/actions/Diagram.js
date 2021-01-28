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
export function updateNodePropierties(propierties){
    return{
        type:UPDATE_NODE_PROPIERTIES,
        propierties
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