const API_ROOT= 'http://127.0.0.1:8000/eeg/'


export const FETCH_FILE_ID_RECEIVE = 'FETCH_FILE_ID_RECEIVE'
function receiveFileId(json) {
  return {
    type: FETCH_FILE_ID_RECEIVE,
    fileId:json["id"]
    
  }
}

export const FETCH_FILE_INFO_REQUEST = 'FETCH_FILE_INFO_REQUEST'
function requestFileInfo() {
  return {
    type: FETCH_FILE_INFO_REQUEST,
  }
}

export const FETCH_FILE_INFO_RECEIVE = 'FETCH_FILE_INFO_RECEIVE'
function receiveFileInfo(json) {
  return {
    type: FETCH_FILE_INFO_RECEIVE,
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


export const postFileInfo = (fileIdServer) => async (dispatch) =>{
    var url = API_ROOT+'info/?'
    var initFetch={
      method: 'POST',
      body:JSON.stringify({"id": fileIdServer}),
      headers: {
        'Content-Type': 'application/json'
      },
    };

    //dispatch(requestFileInfo(fileId))
    try {
        fetch(url,initFetch)
        .then(res => res.json())
        .then(json => dispatch(receiveFileId(json)))
    }
    catch (error){
      console.log("Error al hacer post de fileIdServer")
        //dispatch(errorFetchingFileInfo(error))
    }
}

export const getFileInfo = (fileId) => async (dispatch) =>{
  var url = API_ROOT+'info/?'+new URLSearchParams({
    id: fileId,
  })
  var header= new Headers()
  var initFetch={
    method: 'GET',
    headers: header,
    mode: 'cors',
    cache: 'default'
  };

  dispatch(requestFileInfo())
  try {
    fetch(url,initFetch)
    .then(res => res.json())
    .then(json => dispatch(receiveFileInfo(json)))
  }
  catch (error){
    dispatch(errorFetchingFileInfo(error))
  }

}