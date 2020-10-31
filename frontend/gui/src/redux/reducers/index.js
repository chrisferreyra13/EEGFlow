import { combineReducers } from 'redux' 
//import signal from './signal'
import {timeSeries} from './Signal'
import {changeStateSidebar, plots} from './SideBar'
import {file} from './File'
import {dashboardDataPreview} from './Dashboard'
import {form} from './Form'

const rootReducer = combineReducers({
    changeStateSidebar,
    plots,
    timeSeries,
    file,
    dashboardDataPreview,
    form,
});

export default rootReducer