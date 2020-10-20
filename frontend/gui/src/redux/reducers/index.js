import { combineReducers } from 'redux' 
//import signal from './signal'
import {temporalSignal} from './Signal'
import {changeStateSidebar, plots} from './SideBar'

const rootReducer = combineReducers({
    changeStateSidebar,
    plots,
    temporalSignal,
});

export default rootReducer