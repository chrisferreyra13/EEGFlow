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
function receiveFileInfo(payload) {
  return {
    type: FETCH_FILE_INFO_RECEIVE,
    fileInfo: payload,
    
  }
}

export const FETCH_FILE_INFO_FAILURE = 'FETCH_FILE_INFO_FAILURE'
function errorFetchingFileInfo(payload){
    return {
        type: FETCH_FILE_INFO_FAILURE,
        error:payload
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
    fetch(url,initFetch)
      .then(res => {
        if(!res.ok){
            return res.text().then(text => { throw new Error(text) })
        }else {return res.json()}
      })
      .then(json => dispatch(receiveFileId(json)))
      .catch(error => {
          console.log("error")
      })

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
  fetch(url,initFetch)
  .then(res => {
    if(!res.ok){
        return res.text().then(text => { throw new Error(text) })
    }else {return res.json()}
  })
  .then(json => dispatch(receiveFileInfo(json)))
  .catch(error => {
    dispatch(errorFetchingFileInfo(error))
  })


}