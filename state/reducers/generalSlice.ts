import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";

interface generalSliceProps {
  coordinatesEuref: [number, number];
  coordinatesWGS84: [number, number];
  isHelpOpen: boolean;
  user: string;
  checksum: string;
}

// todo: get the initial location to here
const initialState: generalSliceProps = {
  coordinatesEuref: [0, 0],
  coordinatesWGS84: [0, 0],
  isHelpOpen: false,
  user: "",
  checksum: "",
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
    setHelpOpen: (state, action: PayloadAction<boolean>) => {
      return { ...state, isHelpOpen: action.payload };
    },
    setUser: (state, action: PayloadAction<string>) => {
      return { ...state, user: action.payload };
    },
    setChecksum: (state, action: PayloadAction<string>) => {
      return { ...state, checksum: action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, (state) => ({
      ...initialState,
      user: state.user,
      checksum: state.checksum,
    }));
  },
});

export const { setServicepointLocationEuref, setServicepointLocationWGS84, setHelpOpen, setUser, setChecksum } = generalSlice.actions;

export default generalSlice.reducer;
