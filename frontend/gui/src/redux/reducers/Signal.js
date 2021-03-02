import {
    FETCH_TIME_SERIES_REQUEST,
    FETCH_TIME_SERIES_RECEIVE,
    FETCH_TIME_SERIES_FAILURE,
} from '../actions/Signal'

const initialState={
    signal: [],
    sFreq: 0,
    isFetching: false,
}

//export const signal = (state = initialState, { type, ...rest }) => {}

export const timeSeries = (state = initialState, { type, ...rest }) => {
    switch (type) {
        case FETCH_TIME_SERIES_REQUEST:
          return Object.assign({}, state, {
              isFetching: true
            })
        case FETCH_TIME_SERIES_RECEIVE:
          return Object.assign({},state, {
              isFetching: false,
              signal: rest.signal,
              sFreq: rest.samplingFreq
            })
        case FETCH_TIME_SERIES_FAILURE:
            return {...state, ...rest}
        default:
          return state
    }
}
