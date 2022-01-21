import {FETCH_EVENTS_RECEIVE, FETCH_EVENTS_REQUEST, FETCH_EVENTS_FORM_FAILURE} from '../actions/Events'

const initialState={
    eventId: [],
    eventSamples: [],
    isFetching: true,
    errors:{
        fetchingEvents:false
    }
}

export const events = (state=initialState, {type, ...rest}) => {
    switch(type){
        case FETCH_EVENTS_REQUEST:
            return Object.assign({},state,{
                isFetching: true,
                errors:{
                    ...state.errors,
                    fetchingEvents:false
                }
            })
        case FETCH_EVENTS_RECEIVE:
            return Object.assign({},state,{
                eventId: rest.events['event_id'],
                eventSamples: rest.events['event_samples'],
                isFetching: false
            })
        case FETCH_EVENTS_FORM_FAILURE:
            return Object.assign({},state,{
                isFetching: false,
                errors:{
                    ...state.errors,
                    fetchingEvents:true
                }
            })
        default:
            return state
    }
}