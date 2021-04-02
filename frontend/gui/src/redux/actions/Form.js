
export const UPDATE_PARAMS = 'UPDATE_PARAMS'
export function updateForm(data){
    return{
        type: UPDATE_PARAMS,
        data
    }
}

export const OK_FORM = 'OK_FORM'
export function okForm(){
    return{
        type: OK_FORM
    }
}

export const CANCEL_FORM = 'CANCEL_FORM'
export function cancelForm(){
    return{
        type: CANCEL_FORM
    }
}

export const ENABLE_FORM = 'ENABLE_FORM'
export function enableForm(id,formType){
    return{
        type: ENABLE_FORM,
        formType:formType,
        id:id
    }
}

export const FETCH_DATA_FORM_REQUEST = 'FETCH_DATA_FORM_REQUEST'
export function requestDataForm(formType){
    return{
        type: FETCH_DATA_FORM_REQUEST,
        formType
    }
}

export const FETCH_DATA_FORM_RECEIVE = 'FETCH_DATA_FORM_RECEIVE'
export function receiveDataForm(){
    return{
        type: FETCH_DATA_FORM_RECEIVE,
        
    }
}

export const FETCH_DATA_FORM_FAILURE = 'FETCH_DATA_FORM_FAILURE'
export function errorFetchingDataForm(error){
    return{
        type: FETCH_DATA_FORM_FAILURE,
        error
    }
}

