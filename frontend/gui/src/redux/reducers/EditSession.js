import {
    CHANGE_VIEW,
    LINK_DIAGRAM
} from '../actions/EditSession';


const initialState={
    diagramView: false,
    linkDiagram: true,
}

export const editSession= (state=initialState, {type, ...rest})=>{
    switch(type){
        case CHANGE_VIEW:
            return Object.assign({},state,{
                diagramView:rest.activate
            })

        case LINK_DIAGRAM:
            return Object.assign({},state,{
                linkDiagram:!state.linkDiagram
            })

        default:
            return state
    }
}