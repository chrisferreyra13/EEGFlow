import {
    FETCH_TIME_SERIES_REQUEST,
    FETCH_TIME_SERIES_RECEIVE,
    FETCH_TIME_SERIES_FAILURE,
} from '../actions/Signal'

const initialState={
    signal: [],
    sFreq: 0,
    chNames: [],
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
            console.log(rest)
          return Object.assign({},state, {
              isFetching: false,
              signal: rest.timeSeries['signal'],
              sFreq: rest.timeSeries['sampling_freq'],
              chNames: rest.timeSeries['ch_names']
            })
        case FETCH_TIME_SERIES_FAILURE:
            return {...state, ...rest}
        default:
          return state
    }
}
