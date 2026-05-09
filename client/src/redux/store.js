import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import authReducer from './slices/authSlice';
import rentReducer from './slices/rentSlice';
import watchReducer from './slices/watchSlice';
import searchReducer from './slices/searchSlice';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rent: rentReducer,
    watchlist: watchReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({ 
      thunk: false,
      serializableCheck: {
        ignoredActions: ['payment/checkout'],
      },
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

sagaMiddleware.run(rootSaga);
