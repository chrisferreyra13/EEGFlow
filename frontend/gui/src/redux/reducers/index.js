import { combineReducers } from 'redux' 
//import signal from './signal'
import {temporalSignal} from './Signal'
import {changeStateSidebar, plots} from './SideBar'
import {file} from './File'
import {dashboardDataPreview} from './Dashboard'

const rootReducer = combineReducers({
    changeStateSidebar,
    plots,
    temporalSignal,
    file,
    dashboardDataPreview,
});

export default rootReducer