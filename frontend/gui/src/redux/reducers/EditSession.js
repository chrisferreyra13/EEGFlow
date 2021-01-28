import {
    CHANGE_VIEW
} from '../actions/EditSession';


const initialState={
    diagramView: false,
}

export const editSession= (state=initialState, {type, ...rest})=>{
    switch(type){
        case CHANGE_VIEW:
            return Object.assign({},state,{
                diagramView:rest.activate
            })

        default:
            return state
    }
}