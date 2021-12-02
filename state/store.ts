import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";

import { combineReducers } from "redux";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/es/storage";
import generalSlice from "./reducers/generalSlice";
import formReducer from "./reducers/formSlice";
import additionalInfoReducer from "./reducers/additionalInfoSlice";

// need to use combineReducers ref: https://saurabhshah23.medium.com/redux-persist-redux-toolkit-implementation-made-easy-for-react-native-and-react-js-831ee1e3f22b#88aa
const rootReducers = combineReducers({
  formReducer,
  additionalInfoReducer,
  generalSlice,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage: AsyncStorage,
  // blacklist: ["age"], //blacklisting a store attribute name, will not persist that store attribute, also works with whitelisting
};

const persistedReducer = persistReducer(persistConfig, rootReducers);

const store = configureStore({
  reducer: persistedReducer,
  // middleware option needs to be provided for avoiding the error. ref: https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
});

// todo: if reducers added consider creating function for clearing all reducer states here

export const persistor = persistStore(store);
export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
