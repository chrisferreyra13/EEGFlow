import {
    FETCH_FILE_INFO_REQUEST,
    FETCH_FILE_INFO_RECEIVE,
    FETCH_FILE_INFO_FAILURE,
    FETCH_FILE_ID_RECEIVE,
} from '../actions/File'

const initialStateFile={
    fileId: '69', //40 .fif 69 .edf
    fileInfo:{
        projectId:"",
        projectName:"",
        projectExperimenter:"",
        measurementDate:"",
        numberOfChannels:"",
        customRefApplied:"",
        channels:[]
    },
    isFetching: false,
}

export const file = (state = initialStateFile, { type, ...rest }) => {
    switch (type) {
        case FETCH_FILE_ID_RECEIVE:
          return Object.assign({}, state, {
              fileId: rest.fileId,
              isFetching: true
          })

        case FETCH_FILE_INFO_REQUEST:
          return Object.assign({}, state, {
              isFetching: true
          })
        case FETCH_FILE_INFO_RECEIVE:
            let fileInfo={
                projectId:rest.fileInfo["proj_id"],
                projectName:rest.fileInfo["proj_name"],
                projectExperimenter:rest.fileInfo["experimenter"],
                measurementDate:rest.fileInfo["meas_date"],
                numberOfChannels:rest.fileInfo["nchan"],
                customRefApplied:rest.fileInfo["custom_ref_applied"],
                channels:rest.fileInfo["ch_names"].split(','),
            }
          return Object.assign({},state, {
              isFetching: false,
              fileInfo: fileInfo,
          })
        case FETCH_FILE_INFO_FAILURE:
            return Object.assign({},state, {
                isFetching: false,
            })
        default:
          return state
    }
}
