import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface generalSliceProps {
  coordinates: [number, number];
}

// todo: get the initial location to here
const initialState: generalSliceProps = {
  coordinates: [0, 0],
};

export const generalSlice = createSlice({
  name: "generalSlice",
  initialState,
  reducers: {
    setServicepointLocation: (
      state,
      action: PayloadAction<{ coordinates: [number, number] }>
    ) => {
      const coordinates = action.payload.coordinates;
      return { ...state, coordinates };
    },
  },
});

export const { setServicepointLocation } = generalSlice.actions;

export default generalSlice.reducer;
