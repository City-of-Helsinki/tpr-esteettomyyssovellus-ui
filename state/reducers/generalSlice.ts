import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface generalSliceProps {
  coordinates: [number, number];
  coordinatesWGS84: [number, number];
  user: string | string[];
  currentlyEditingQuestionAddinfo: number;
  currentlyEditingBlockAddinfo: number;
  coordinatesTemp?: [number, number];
  coordinatesWGS84Temp?: [number, number];
}

// todo: get the initial location to here
const initialState: generalSliceProps = {
  coordinates: [0, 0],
  coordinatesWGS84: [0, 0],
  user: "",
  currentlyEditingQuestionAddinfo: -1,
  currentlyEditingBlockAddinfo: -1,
  coordinatesTemp: [0, 0],
  coordinatesWGS84Temp: [0, 0],
};

export const generalSlice = createSlice({
  name: "generalSlice",
  initialState,
  reducers: {
    // todo maybe remove this
    clearGeneralState: (state) => {
      return {
        ...initialState,
        user: state.user,
      };
    },
    // used to store question number to state when going/coming from addinfo page, to be able to init screen to correct place
    setCurrentlyEditingQuestion: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        currentlyEditingQuestionAddinfo: action.payload,
      };
    },
    // used to store block number to state when going/coming from addinfo page, to be able to init screen to correct place
    setCurrentlyEditingBlock: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        currentlyEditingBlockAddinfo: action.payload,
      };
    },
    setServicepointLocation: (
      state,
      action: PayloadAction<{ coordinates: [number, number] }>
    ) => {
      const coordinates = action.payload.coordinates;
      return { ...state, coordinates };
    },
    setServicepointLocationWGS84: (
      state,
      action: PayloadAction<{ coordinatesWGS84: [number, number] }>
    ) => {
      const coordinatesWGS84 = action.payload.coordinatesWGS84;
      return { ...state, coordinatesWGS84 };
    },

    setUser: (state, action: PayloadAction<string | string[]>) => {
      return {
        ...state,
        user: action.payload,
      };
    },
    setCurEditingBothCoordinateTemps: (
      state,
      action: PayloadAction<{
        coordinates: [number, number];
        coordinatesWGS84: [number, number];
      }>
    ) => {
      return {
        ...state,
        coordinatesTemp: action.payload.coordinates,
        coordinatesWGS84Temp: action.payload.coordinatesWGS84,
      };
    },
  },
});

export const {
  clearGeneralState,
  setServicepointLocation,
  setServicepointLocationWGS84,
  setCurrentlyEditingBlock,
  setUser,
  setCurrentlyEditingQuestion,
  setCurEditingBothCoordinateTemps,
} = generalSlice.actions;

export default generalSlice.reducer;
