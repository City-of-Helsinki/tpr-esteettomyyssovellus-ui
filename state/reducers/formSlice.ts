import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface formState {
  answeredChoices: string[];
}

const initialState: formState = {
  answeredChoices: [],
};

export const formSlice = createSlice({
  name: "mainForm",
  initialState,
  reducers: {
    setAnsweredChoice: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        answeredChoices: [...state.answeredChoices, action.payload],
      };
    },
  },
});

export const { setAnsweredChoice } = formSlice.actions;

export default formSlice.reducer;
