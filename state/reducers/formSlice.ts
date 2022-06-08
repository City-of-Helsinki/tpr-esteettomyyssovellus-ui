import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { KeyValueNumber, KeyValueString } from "../../types/general";

interface formState {
  currentServicepointId: number;
  currentEntranceId: number;
  // answeredChoices: number[];
  answers: KeyValueNumber;
  extraAnswers: KeyValueString;
  isContinueClicked: boolean;
  finishedBlocks: number[];
  startedAnswering: string;
  invalidBlocks: number[];
  // formFinished: boolean;
  // formSubmitted: boolean;
}

const initialState: formState = {
  currentServicepointId: -1,
  currentEntranceId: -1,
  // answeredChoices: [],
  answers: {},
  extraAnswers: {},
  isContinueClicked: false,
  finishedBlocks: [],
  startedAnswering: "",
  invalidBlocks: [],
  // formFinished: false,
  // formSubmitted: false,
};

export const formSlice = createSlice({
  name: "mainForm",
  initialState,
  reducers: {
    setServicepointId: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        currentServicepointId: action.payload,
      };
    },
    setEntranceId: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        currentEntranceId: action.payload,
      };
    },
    /*
    setAnsweredChoice: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        answeredChoices: [...state.answeredChoices, action.payload],
      };
    },
    removeAnsweredChoice: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        answeredChoices: [...(state.answeredChoices?.filter((elem) => elem !== action.payload) ?? [])],
      };
    },
    */
    setAnswer: (state, action: PayloadAction<{ questionId: number; answer: number }>) => {
      return {
        ...state,
        answers: { ...state.answers, [action.payload.questionId]: action.payload.answer },
      };
    },
    setAnswers: (state, action: PayloadAction<KeyValueNumber>) => {
      return {
        ...state,
        answers: { ...action.payload },
      };
    },
    setExtraAnswer: (state, action: PayloadAction<{ questionBlockFieldId: number; answer: string }>) => {
      return {
        ...state,
        extraAnswers: { ...state.extraAnswers, [action.payload.questionBlockFieldId]: action.payload.answer },
      };
    },
    setExtraAnswers: (state, action: PayloadAction<KeyValueString>) => {
      return {
        ...state,
        extraAnswers: { ...action.payload },
      };
    },
    setContinue: (state) => {
      return {
        ...state,
        isContinueClicked: true,
      };
    },
    /*
    unsetContinue: (state) => {
      return {
        ...state,
        isContinueClicked: false,
      };
    },
    */
    setFinished: (state, action: PayloadAction<number>) => {
      if (!state.finishedBlocks.includes(action.payload)) {
        return {
          ...state,
          finishedBlocks: [...state.finishedBlocks, action.payload],
        };
      }
      return {
        ...state,
      };
    },
    unsetFinished: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        finishedBlocks: [...(state.finishedBlocks?.filter((elem) => elem !== action.payload) ?? [])],
      };
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        startedAnswering: action.payload,
      };
    },
    setInvalid: (state, action: PayloadAction<number>) => {
      if (!state.invalidBlocks.includes(action.payload)) {
        return {
          ...state,
          invalidBlocks: [...state.invalidBlocks, action.payload],
        };
      }
      return {
        ...state,
      };
    },
    unsetInvalid: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        invalidBlocks: [...(state.invalidBlocks?.filter((elem) => elem !== action.payload) ?? [])],
      };
    },
    /*
    setFormFinished: (state) => {
      return {
        ...state,
        formFinished: true,
      };
    },
    unsetFormFinished: (state) => {
      return {
        ...state,
        formFinished: false,
      };
    },
    */
    /*
    setFormSubmitted: (state) => {
      return {
        ...state,
        formSubmitted: true,
      };
    },
    */
  },
  extraReducers: (builder) => {
    builder.addCase(PURGE, () => ({
      ...initialState,
    }));
  },
});
export const {
  setServicepointId,
  setEntranceId,
  // setAnsweredChoice,
  // removeAnsweredChoice,
  setAnswer,
  setAnswers,
  setExtraAnswer,
  setExtraAnswers,
  setContinue,
  // unsetContinue,
  setFinished,
  unsetFinished,
  setStartDate,
  setInvalid,
  unsetInvalid,
  // setFormFinished,
  // unsetFormFinished,
  // setFormSubmitted,
} = formSlice.actions;

export default formSlice.reducer;
