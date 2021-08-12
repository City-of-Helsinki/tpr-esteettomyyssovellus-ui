import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface generalSliceProps {
  coordinates: [number, number];
  user: string | string[];
  currentlyEditingQuestionAddinfo: number;
  currentlyEditingBlockAddinfo: number;
}

// todo: get the initial location to here
const initialState: generalSliceProps = {
  coordinates: [0, 0],
  user: "",
  currentlyEditingQuestionAddinfo: -1,
  currentlyEditingBlockAddinfo: -1,
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
    setUser: (state, action: PayloadAction<string | string[]>) => {
      return {
        ...state,
        user: action.payload,
      };
    },
  },
});

export const {
  clearGeneralState,
  setServicepointLocation,
  setCurrentlyEditingBlock,
  setUser,
  setCurrentlyEditingQuestion,
} = generalSlice.actions;

export default generalSlice.reducer;
