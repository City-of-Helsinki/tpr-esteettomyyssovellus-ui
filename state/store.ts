import { configureStore } from "@reduxjs/toolkit";
import exampleSlice from "./reducers/exampleSlice";

// delete example reducer & exampleSlice just an example for toolkit

export const store = configureStore({
  reducer: {
    exampleReducer: exampleSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
