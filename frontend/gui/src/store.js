import { createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
//import api from './redux/middleware/api';

import rootReducer from './redux/reducers/index'


const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

export default store;