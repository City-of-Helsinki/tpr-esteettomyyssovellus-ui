import { configureStore } from "@reduxjs/toolkit";
import exampleSlice from "./reducers/exampleSlice";
import additionalInfoSlice from "./reducers/additionalInfoSlice";
import general from "./reducers/general";

// delete example reducer & exampleSlice just an example for toolkit

export const store = configureStore({
  reducer: {
    exampleReducer: exampleSlice,
    additionalInfoReducer: additionalInfoSlice,
    general: general
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
