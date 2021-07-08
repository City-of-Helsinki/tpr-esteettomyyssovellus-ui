import { createSlice, Dictionary, PayloadAction } from "@reduxjs/toolkit";
import { string } from "yup/lib/locale";
import type { RootState } from "../store";

interface formState {
  currentServicepointId: any;
  currentEntranceId: any;
  answeredChoices: string[];
  answers: { [key: number]: number };
  isContinueClicked: boolean;
  finishedBlocks: number[];
}

const initialState: formState = {
  currentServicepointId: "",
  currentEntranceId: "",
  answeredChoices: [],
  answers: {},
  isContinueClicked: false,
  finishedBlocks: []
};

export const formSlice = createSlice({
  name: "mainForm",
  initialState,
  reducers: {
    setServicepointId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        currentServicepointId: action.payload
      };
    },
    setEntranceId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        currentEntranceId: action.payload
      };
    },
    setAnsweredChoice: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        answeredChoices: [...state.answeredChoices, action.payload]
      };
    },
    removeAnsweredChoice: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        answeredChoices: [
          ...(state.answeredChoices?.filter((elem) => elem != action.payload) ??
            [])
        ]
      };
    },
    setAnswer: (
      state,
      action: PayloadAction<{ questionNumber: number; answer: number }>
    ) => {
      const qNumber = action.payload.questionNumber;
      const a = action.payload.answer;
      return {
        ...state,
        answers: { ...state.answers, [qNumber]: a }
      };
    },
    setContinue: (state) => {
      return {
        ...state,
        isContinueClicked: true
      };
    },
    unsetContinue: (state) => {
      return {
        ...state,
        isContinueClicked: false
      };
    },
    setFinished: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        finishedBlocks: [...state.finishedBlocks, action.payload]
      };
    },
    unsetFinished: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        finishedBlocks: [
          ...(state.finishedBlocks?.filter((elem) => elem != action.payload) ??
            [])
        ]
      };
    }
  }
});

export const {
  setServicepointId,
  setEntranceId,
  setAnsweredChoice,
  removeAnsweredChoice,
  setAnswer,
  setContinue,
  unsetContinue,
  setFinished,
  unsetFinished
} = formSlice.actions;

export default formSlice.reducer;
