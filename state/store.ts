import { configureStore } from "@reduxjs/toolkit";

import { combineReducers } from "redux";

// import AsyncStorage from "@react-native-async-storage/async-storage";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import generalSlice from "./reducers/generalSlice";
import formReducer from "./reducers/formSlice";
import additionalInfoReducer from "./reducers/additionalInfoSlice";

// need to use combineReducers ref: https://saurabhshah23.medium.com/redux-persist-redux-toolkit-implementation-made-easy-for-react-native-and-react-js-831ee1e3f22b#88aa
const rootReducer = combineReducers({
  formReducer,
  additionalInfoReducer,
  generalSlice,
});

const persistConfig = {
  key: "root",
  version: 1,
  // storage: AsyncStorage,
  storage,
  // blacklist: ["age"], //blacklisting a store attribute name, will not persist that store attribute, also works with whitelisting
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  // middleware option needs to be provided for avoiding the error. ref: https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Note: use persistor.purge to clear all state, which uses the PURGE case in each reducer
export const persistor = persistStore(store);
export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
