import { createSlice, Dictionary, PayloadAction } from "@reduxjs/toolkit";
import { string } from "yup/lib/locale";
import type { RootState } from "../store";


interface formState {
  answeredChoices: string[];
  answers:{ [key: number]: number; }
}

const initialState: formState = {
  answeredChoices: [],
  answers: {}
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
    removeAnsweredChoice: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        answeredChoices: [...state.answeredChoices?.filter((elem) => elem != action.payload) ?? []],
      };
    },
    setAnswer: (state, action: PayloadAction<{ questionNumber: number; answer: number; }>) => {
      const qNumber = action.payload.questionNumber;
      const a = action.payload.answer;
      return {
        ...state,
        answers: {...state.answers, [qNumber]: a}
      }
    }
  },
});

export const { setAnsweredChoice, removeAnsweredChoice, setAnswer } = formSlice.actions;

export default formSlice.reducer;
