const API_ROOT= 'http://127.0.0.1:8000/eeg/'

export const FETCH_FILE_INFO_REQUEST = 'FETCH_FILE_INFO_REQUEST'
function requestFileInfo(fileId) {
  return {
    type: FETCH_FILE_INFO_REQUEST,
    fileId
  }
}

export const FETCH_FILE_INFO_RECEIVE = 'FETCH_FILE_INFO_RECEIVE'
function receiveFileInfo(fileId, json) {
  return {
    type: FETCH_FILE_INFO_RECEIVE,
    fileId,
    fileInfo: json,
    
  }
}

export const FETCH_FILE_INFO_FAILURE = 'FETCH_FILE_INFO_FAILURE'
function errorFetchingFileInfo(error){
    return {
        type: FETCH_FILE_INFO_FAILURE,
        error
    }
}


export const getFileInfo = (fileId) => async (dispatch) =>{
    var url = API_ROOT+'info/?'
    
    var header= new Headers()
    var initFetch={
      method: 'POST',
      body:JSON.stringify({"id": fileId}),
      headers: {
        'Content-Type': 'application/json'
      },
      /*mode: 'cors',
      cache: 'default'*/
    };

    dispatch(requestFileInfo(fileId))
    try {
        fetch(url,initFetch)
        .then(res => res.json())
        .then(json => dispatch(receiveFileInfo(fileId, json)))
    }
    catch (error){
        dispatch(errorFetchingFileInfo(error))
    }
}
