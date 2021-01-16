export const ADD_NODE='ADD_NODE'
export function addNode(nodeType){
    return{
        type:ADD_NODE,
        nodeType
    }
}

export const UPDATE_NODE_PROPIERTIES='UPDATE_NODE_PROPIERTIES'
export function updateNodePropierties(propierties){
    return{
        type:UPDATE_NODE_PROPIERTIES,
        propierties
    }
}

export const DELETE_NODE='DELETE_NODE'
export function deleteNodes(nodesIds){
    return{
        type:DELETE_NODE,
        nodesIds
    }
}