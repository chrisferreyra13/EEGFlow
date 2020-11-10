import{
    CANCEL_FORM,
    OK_FORM,
    FETCH_DATA_FORM_REQUEST,
    FETCH_DATA_FORM_RECEIVE,
    FETCH_DATA_FORM_FAILURE
} from '../actions/Form'

const initialState={
    formType: null,
    isFetching: false
}

export const form = (state=initialState, {type, ...rest}) => {
    switch(type){
        case OK_FORM:    
            return Object.assign({},state,{
                formType: null
            })
        case CANCEL_FORM:    
            return Object.assign({},state,{
                formType: null
            })
        case FETCH_DATA_FORM_REQUEST:
            return Object.assign({},state,{
                formType:rest.formType,
                isFetching: true
            })
        case FETCH_DATA_FORM_RECEIVE:
            return Object.assign({},state,{
                isFetching: false
            })
        case FETCH_DATA_FORM_FAILURE:
            return {...state, ...rest}
        default:
            return state
    }
}