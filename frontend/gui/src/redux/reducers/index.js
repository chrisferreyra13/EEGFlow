import { combineReducers } from 'redux' 
//import signal from './signal'
import {timeSeries} from './Signal'
import {changeStateSidebar, plots} from './SideBar'
import {file} from './File'
import {dashboardDataPreview} from './Dashboard'
import {form} from './Form'
import {events} from './Events'
import {diagram} from './Diagram'

const rootReducer = combineReducers({
    changeStateSidebar,
    plots,
    timeSeries,
    file,
    dashboardDataPreview,
    form,
    events,
    diagram,
});

export default rootReducer