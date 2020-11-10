import {requestDataForm, receiveDataForm, errorFetchingDataForm} from './Form'

const API_ROOT= 'http://127.0.0.1:8000/data/eeg/'


export const FETCH_EVENTS_RECEIVE = 'FETCH_EVENTS_RECEIVE'
export function receiveEvents(events){
    return{
        type: FETCH_EVENTS_RECEIVE,
        events
    }
}

export const enableEventForm = () => async (dispatch) =>{
    const jsonPrueba={
        eventType: ['rt','square','rt'],
        eventLatency: [1.002,2.05,5.43]
    }
    dispatch(requestDataForm('ENABLE_EVENT_FORM'))
    try{
        dispatch(receiveEvents(jsonPrueba))
        dispatch(receiveDataForm())
    }catch(error){
        dispatch(errorFetchingDataForm(error))
    }
}
