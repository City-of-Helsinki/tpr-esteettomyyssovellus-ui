// this just example -> delete later when legit reducers / slices

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface userState {
  user: string,
  authenticated: boolean
}

const initialState: userState = {
  user: "matti",
  authenticated: false
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    authenticate: (state, action: PayloadAction<boolean>) => {
      state.authenticated = true;
    },
  },
});

export const { authenticate } = userSlice.actions;

export default userSlice.reducer;
