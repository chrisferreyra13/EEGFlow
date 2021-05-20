import { createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
//import promise from 'redux-promise';
//import api from './redux/middleware/api';

import rootReducer from './redux/reducers/index'

const middleware=[thunk, logger]

const store = createStore(
  rootReducer,
  applyMiddleware(...middleware),
);

export default store;