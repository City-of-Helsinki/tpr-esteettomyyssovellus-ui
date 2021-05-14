import { configureStore } from "@reduxjs/toolkit";
import exampleSlice from "./reducers/exampleSlice";
import { userSlice } from "./reducers/userSclice";

// delete example reducer & exampleSlice just an example for toolkit

export const store = configureStore({
  reducer: {
    exampleReducer: exampleSlice,
    //general: userSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
