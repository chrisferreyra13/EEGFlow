import {
    ENABLE_LIST_GROUP_FILE_INFO,
    DISABLE_LIST_GROUP_FILE_INFO,
  } from '../actions/Dashboard'
  
  const initialStateDashboardDataPreview = {
      enableListGroupFileInfo: false
  }
  
  export const dashboardDataPreview = (state = initialStateDashboardDataPreview, { type, ...rest }) => {
    switch (type) {
      case ENABLE_LIST_GROUP_FILE_INFO:
        return Object.assign({}, state, {
          enableListGroupFileInfo: true
        })
      case DISABLE_LIST_GROUP_FILE_INFO:
        return Object.assign({},state,{
          enableListGroupFileInfo:false
        })
      default:
        return state
    }
  }