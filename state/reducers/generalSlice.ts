import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

interface generalSliceProps {
  coordinatesEuref: [number, number];
  coordinatesWGS84: [number, number];
  user: string;
}

// todo: get the initial location to here
const initialState: generalSliceProps = {
  coordinatesEuref: [0, 0],
  coordinatesWGS84: [0, 0],
  user: "",
};

export const generalSlice = createSlice({
  name: "generalSlice",
  initialState,
  reducers: {
    setServicepointLocationEuref: (state, action: PayloadAction<{ coordinatesEuref: [number, number] }>) => {
      const { coordinatesEuref } = action.payload;
      return { ...state, coordinatesEuref };
    },
    setServicepointLocationWGS84: (state, action: PayloadAction<{ coordinatesWGS84: [number, number] }>) => {
      const { coordinatesWGS84 } = action.payload;
      return { ...state, coordinatesWGS84 };
    },

    setUser: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        user: action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, (state) => ({
      ...initialState,
      user: state.user,
    }));
  },
});

export const { setServicepointLocationEuref, setServicepointLocationWGS84, setUser } = generalSlice.actions;

export default generalSlice.reducer;
