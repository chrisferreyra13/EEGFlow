import{
    CANCEL_FORM,
    ENABLE_EVENT_FORM,
    OK_FORM,
} from '../actions/Form'

const initialState={
    formType: ''
}

export const form = (state=initialState, {type, ...rest}) => {
    switch(type){
        case ENABLE_EVENT_FORM:
            return Object.assign({},state,{
                formType:ENABLE_EVENT_FORM
            })
        case OK_FORM:    
            return Object.assign({},state,{
                formType: ''
            })
        case CANCEL_FORM:    
            return Object.assign({},state,{
                formType: ''
            })    
        default:
            return state
    }
}