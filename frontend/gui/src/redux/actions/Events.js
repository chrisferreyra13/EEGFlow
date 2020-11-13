
const API_ROOT= 'http://127.0.0.1:8000/data/eeg/'


export const FETCH_EVENTS_REQUEST = 'FETCH_EVENTS_REQUEST'
export function requestEvents(){
    return{
        type: FETCH_EVENTS_REQUEST,
    }
}

export const FETCH_EVENTS_RECEIVE = 'FETCH_EVENTS_RECEIVE'
export function receiveEvents(events){
    return{
        type: FETCH_EVENTS_RECEIVE,
        events
    }
}

export const FETCH_EVENTS_FORM_FAILURE = 'FETCH_EVENTS_FORM_FAILURE'
export function errorFetchingEvents(error){
    return{
        type: FETCH_EVENTS_FORM_FAILURE,
        error
    }
}

export const fetchEvents = () => async (dispatch) =>{
    const jsonPrueba={
        eventType: ['rt','square','rt'],
        eventLatency: [1.002,2.05,5.43]
    }
    dispatch(requestEvents())
    try{
        dispatch(receiveEvents(jsonPrueba))
    }catch(error){
        dispatch(errorFetchingEvents(error))
    }
}
