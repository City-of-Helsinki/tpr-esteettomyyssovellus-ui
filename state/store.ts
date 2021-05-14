import { configureStore } from "@reduxjs/toolkit";
import exampleSlice from "./reducers/exampleSlice";
import general from "./reducers/general";

// delete example reducer & exampleSlice just an example for toolkit

export const store = configureStore({
  reducer: {
    exampleReducer: exampleSlice,
    general: general
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
