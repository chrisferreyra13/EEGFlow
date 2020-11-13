import {FETCH_EVENTS_RECEIVE, FETCH_EVENTS_REQUEST, FETCH_EVENTS_FORM_FAILURE} from '../actions/Events'

const initialState={
    eventType: [],
    eventLatency: [],
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
                eventType: rest.events.eventType,
                eventLatency: rest.events.eventLatency,
                isFetching: false
            })
        case FETCH_EVENTS_FORM_FAILURE:
            return {...state, ...rest}
        default:
            return state
    }
}