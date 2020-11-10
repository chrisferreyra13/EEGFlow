import {
  ENABLE_CHART_TEMPORAL,
  ENABLE_EVENT_FORM
} from '../actions/SideBar'

const initialStateSideBar = {
    sidebarShow: 'responsive'
}

export const changeStateSidebar = (state = initialStateSideBar, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return {...state, ...rest }
    default:
      return state
  }
}

const initialStatePlots = {
  chartTemporal: false
}
//CAMBIAR ESTO, NO ES UN BUEN PATRON DE DISEÑO
export const plots = (state = initialStatePlots, { type, ...rest }) => {
  switch (type) {
    case ENABLE_CHART_TEMPORAL:
      return Object.assign({}, state, {
        chartTemporal: true
    })
    default:
      return state
  }
}

