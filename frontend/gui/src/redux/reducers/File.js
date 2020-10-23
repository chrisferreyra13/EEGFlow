import {
    FETCH_FILE_INFO_REQUEST,
    FETCH_FILE_INFO_RECEIVE,
    FETCH_FILE_INFO_FAILURE,
} from '../actions/File'

const initialStateFile={
    fileId: 'EMDxhaCPMCdioH3LBnuF6A',
    fileInfo: [],
    isFetching: false,
}

export const file = (state = initialStateFile, { type, ...rest }) => {
    switch (type) {
        case FETCH_FILE_INFO_REQUEST:
          return Object.assign({}, state, {
              id: rest.fileId,
              isFetching: true
          })
        case FETCH_FILE_INFO_RECEIVE:
          return Object.assign({},state, {
              isFetching: false,
              fileInfo: rest.fileInfo,
          })
        case FETCH_FILE_INFO_FAILURE:
            return {...state, ...rest}
        default:
          return state
    }
}
