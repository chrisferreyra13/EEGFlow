import {
    FETCH_TEMPORAL_SIGNAL_REQUEST,
    FETCH_TEMPORAL_SIGNAL_RECEIVE,
    FETCH_TEMPORAL_SIGNAL_FAILURE,
} from '../actions/Signal'

const initialState={
    signal: [],
    isFetching: false,
}

//export const signal = (state = initialState, { type, ...rest }) => {}

export const temporalSignal = (state = initialState, { type, ...rest }) => {
    switch (type) {
        case FETCH_TEMPORAL_SIGNAL_REQUEST:
          return Object.assign({}, state, {
              isFetching: true
            })
        case FETCH_TEMPORAL_SIGNAL_RECEIVE:
          return Object.assign({},state, {
              isFetching: false,
              signal: rest.temporalSignal,
            })
        case FETCH_TEMPORAL_SIGNAL_FAILURE:
            return {...state, ...rest}
        default:
          return state
    }
}
