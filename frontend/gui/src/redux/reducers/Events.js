import {FETCH_EVENTS_RECEIVE} from '../actions/Events'

const initialState={
    eventType: [],
    eventLatency: []
}

export const events = (state=initialState, {type, ...rest}) => {
    switch(type){
        case FETCH_EVENTS_RECEIVE:
            return Object.assign({},state,{
                eventType: rest.events.eventType,
                eventLatency: rest.events.eventLatency
            })
        default:
            return state
    }
}