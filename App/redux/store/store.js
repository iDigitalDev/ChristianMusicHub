import {createStore, combineReducers} from 'redux';
import {accountReducer, playerReducer, appReducer} from '../reducers/reducer';

const rootReducer = combineReducers({
  accountReducer: accountReducer,
  playerReducer: playerReducer,
  appReducer: appReducer,
});

const configureStore = () => createStore(rootReducer);

export default configureStore;
