const API_ROOT= 'http://127.0.0.1:8000/data/eeg/'

export const FETCH_TEMPORAL_SIGNAL_REQUEST = 'FETCH_TEMPORAL_SIGNAL_REQUEST'
function requestTemporalSignal(id) {
  return {
    type: FETCH_TEMPORAL_SIGNAL_REQUEST,
    id
  }
}

export const FETCH_TEMPORAL_SIGNAL_RECEIVE = 'FETCH_TEMPORAL_SIGNAL_RECEIVE'
function receiveTemporalSignal(id, json) {
  return {
    type: FETCH_TEMPORAL_SIGNAL_RECEIVE,
    id,
    temporalSignal: json,
    
  }
}

export const FETCH_TEMPORAL_SIGNAL_FAILURE = 'FETCH_TEMPORAL_SIGNAL_FAILURE'
function errorFetchingTemporalSignal(error){
    return {
        type: FETCH_TEMPORAL_SIGNAL_FAILURE,
        error
    }
}


export const getTemporalSignal = (id) => async (dispatch) =>{
    var url = API_ROOT+'temporal-signal/?' + new URLSearchParams({
      id,
    })
    
    var header= new Headers()
    var initFetch={
      method: 'GET',
      headers: header,
      mode: 'cors',
      cache: 'default'
    };

    dispatch(requestTemporalSignal(id))
    try {
        fetch(url,initFetch)
        .then(res => res.json())
        .then(json => dispatch(receiveTemporalSignal(id, json)))
    }
    catch (error){
        dispatch(errorFetchingTemporalSignal(error))
    }
}

