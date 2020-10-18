import { combineReducers } from 'redux' 
//import signal from './signal'
import {temporalSignal} from './signal'
import {changeStateSidebar} from './changeStateSidebar'

const rootReducer = combineReducers({
    changeStateSidebar,
    temporalSignal,
});

export default rootReducer