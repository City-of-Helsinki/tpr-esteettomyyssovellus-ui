import { configureStore } from "@reduxjs/toolkit";
import additionalInfoReducer from "./reducers/additionalInfoSlice";
import formReducer from "./reducers/formSlice";
import generalSlice from "./reducers/generalSlice";

// delete example reducer & exampleSlice just an example for toolkit

export const store = configureStore({
  reducer: {
    formReducer,
    additionalInfoReducer,
    generalSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
