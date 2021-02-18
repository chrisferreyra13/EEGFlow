import{
    CANCEL_FORM,
    OK_FORM,
    ENABLE_FORM,
    FETCH_DATA_FORM_REQUEST,
    FETCH_DATA_FORM_RECEIVE,
    FETCH_DATA_FORM_FAILURE,
    UPDATE_PARAMS
} from '../actions/Form'

const initialState={
    formType: null,
    params:[],
    isFetching: true,
    nodeId:'0'
}

export const form = (state=initialState, {type, ...rest}) => {
    switch(type){
        case UPDATE_PARAMS:
            return Object.assign({}, state,{
                params:rest.data
            })
        case OK_FORM:    
            return Object.assign({},state,{
                formType: null,
                nodeId: '0'
            })
        case CANCEL_FORM:    
            return Object.assign({},state,{
                formType: null,
                nodeId: '0'
            })
        case ENABLE_FORM:
            return Object.assign({},state,{
                formType:rest.formType,
                nodeId: rest.id
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
        case FETCH_DATA_FORM_FAILURE: //TODO: terminar
            return {...state, ...rest}
        default:
            return state
    }
}