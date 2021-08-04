import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface generalSliceProps {
  coordinates: [number, number];
  user: string | string[];
}

// todo: get the initial location to here
const initialState: generalSliceProps = {
  coordinates: [0, 0],
  user: ""
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
    setUser: (state, action: PayloadAction<string | string[]>) => {
      return {
        ...state,
        user: action.payload
      };
    }
  }
});

export const { setServicepointLocation, setUser } = generalSlice.actions;

export default generalSlice.reducer;
