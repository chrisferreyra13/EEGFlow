import {FETCH_EVENTS_RECEIVE, FETCH_EVENTS_REQUEST, FETCH_EVENTS_FORM_FAILURE} from '../actions/Events'

const initialState={
    eventId: [],
    eventSamples: null,
    isFetching: true
}

export const events = (state=initialState, {type, ...rest}) => {
    switch(type){
        case FETCH_EVENTS_REQUEST:
            return Object.assign({},state,{
                isFetching: true
            })
        case FETCH_EVENTS_RECEIVE:
            return Object.assign({},state,{
                eventId: rest.events.eventId,
                eventSamples: rest.events.eventSamples,
                isFetching: false
            })
        case FETCH_EVENTS_FORM_FAILURE:
            return {...state, ...rest}
        default:
            return state
    }
}