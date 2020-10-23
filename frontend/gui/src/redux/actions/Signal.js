const API_ROOT= 'http://127.0.0.1:8000/data/eeg/'

export const FETCH_TEMPORAL_SIGNAL_REQUEST = 'FETCH_TEMPORAL_SIGNAL_REQUEST'
function requestTemporalSignal() {
  return {
    type: FETCH_TEMPORAL_SIGNAL_REQUEST,
  }
}

export const FETCH_TEMPORAL_SIGNAL_RECEIVE = 'FETCH_TEMPORAL_SIGNAL_RECEIVE'
function receiveTemporalSignal(json) {
  return {
    type: FETCH_TEMPORAL_SIGNAL_RECEIVE,
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


export const getTemporalSignal = (fileId) => async (dispatch) =>{
    var url = API_ROOT+'temporal-signal/?' + new URLSearchParams({
      id: fileId,
    })
    
    var header= new Headers()
    var initFetch={
      method: 'GET',
      headers: header,
      mode: 'cors',
      cache: 'default'
    };

    dispatch(requestTemporalSignal())
    try {
        fetch(url,initFetch)
        .then(res => res.json())
        .then(json => dispatch(receiveTemporalSignal(json)))
    }
    catch (error){
        dispatch(errorFetchingTemporalSignal(error))
    }
}

