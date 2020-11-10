import { combineReducers } from 'redux' 
//import signal from './signal'
import {timeSeries} from './Signal'
import {changeStateSidebar, plots} from './SideBar'
import {file} from './File'
import {dashboardDataPreview} from './Dashboard'
import {form} from './Form'
import {events} from './Events'

const rootReducer = combineReducers({
    changeStateSidebar,
    plots,
    timeSeries,
    file,
    dashboardDataPreview,
    form,
    events,
});

export default rootReducer