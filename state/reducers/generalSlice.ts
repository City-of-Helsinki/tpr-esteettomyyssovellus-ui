import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface generalSliceProps {
  northing: number;
  easting: number;
}

// todo: get the initial location to here
const initialState: generalSliceProps = {
  northing: 0,
  easting: 4,
};

export const generalSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    setLocation: (state) => {
      return { ...state };
    },
  },
});

export const { setLocation } = generalSlice.actions;

export default generalSlice.reducer;
