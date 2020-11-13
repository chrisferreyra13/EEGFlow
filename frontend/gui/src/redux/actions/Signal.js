const API_ROOT= 'http://127.0.0.1:8000/data/eeg/'

export const FETCH_TIME_SERIES_REQUEST = 'FETCH_TIME_SERIES_REQUEST'
function requestTimeSeries() {
  return {
    type: FETCH_TIME_SERIES_REQUEST,
  }
}

export const FETCH_TIME_SERIES_RECEIVE = 'FETCH_TIME_SERIES_RECEIVE'
function receiveTimeSeries(json) {
  return {
    type: FETCH_TIME_SERIES_RECEIVE,
    timeSeries: json,
    
  }
}

export const FETCH_TIME_SERIES_FAILURE = 'FETCH_TIME_SERIES_FAILURE'
function errorFetchingTimeSeries(error){
    return {
        type: FETCH_TIME_SERIES_FAILURE,
        error
    }
}


export const fetchTimeSeries = (fileId) => async (dispatch) =>{
    var url = API_ROOT+'time-series/?' + new URLSearchParams({
      id: fileId,
    })
    
    var header= new Headers()
    var initFetch={
      method: 'GET',
      headers: header,
      mode: 'cors',
      cache: 'default'
    };

    dispatch(requestTimeSeries())
    try {
        fetch(url,initFetch)
        .then(res => res.json())
        .then(json => dispatch(receiveTimeSeries(json)))
    }
    catch (error){
        dispatch(errorFetchingTimeSeries(error))
    }
}

