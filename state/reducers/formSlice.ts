import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { MainPictureProps } from "../../types/general";

interface formState {
  currentServicepointId: number;
  currentEntranceId: number;
  answeredChoices: number[];
  answers: { [key: number]: number };
  extraAnswers: { [key: number]: string };
  isContinueClicked: boolean;
  finishedBlocks: number[];
  startedAnswering: string;
  invalidBlocks: number[];
  // formFinished: boolean;
  // formSubmitted: boolean;
  mainImageElement: string;
  mainImageTempElement?: string;
  mainImageInvalidValues: string[];
  mainImage?: MainPictureProps;
  mainImageTemp?: MainPictureProps;
}

const initialState: formState = {
  currentServicepointId: -1,
  currentEntranceId: -1,
  answeredChoices: [],
  answers: {},
  extraAnswers: {},
  isContinueClicked: false,
  finishedBlocks: [],
  startedAnswering: "",
  invalidBlocks: [],
  // formFinished: false,
  // formSubmitted: false,
  mainImageElement: "",
  mainImageTempElement: "",
  mainImageInvalidValues: [],
  mainImage: {} as MainPictureProps,
  mainImageTemp: {} as MainPictureProps,
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
    setAnswer: (state, action: PayloadAction<{ questionId: number; answer: number }>) => {
      return {
        ...state,
        answers: { ...state.answers, [action.payload.questionId]: action.payload.answer },
      };
    },
    setExtraAnswer: (state, action: PayloadAction<{ questionBlockFieldId: number; answer: string }>) => {
      return {
        ...state,
        extraAnswers: { ...state.extraAnswers, [action.payload.questionBlockFieldId]: action.payload.answer },
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
    // for saving main Image (with location) element for can be upload or link
    addMainImageElement: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        mainImageElement: action.payload,
      };
    },
    // not the prettiest solution, for saving the element for mainpicture edit page
    addMainImageTempElement: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        mainImageTempElement: action.payload,
      };
    },
    // for removing above added element
    removeMainImageElement: (state) => {
      return {
        ...state,
        mainImageElement: "",
      };
    },
    removeMainImageInvalidValue: (state, action: PayloadAction<string>) => {
      const filteredInvalids = state.mainImageInvalidValues.filter((inv) => inv !== action.payload);
      return {
        ...state,
        mainImageInvalidValues: filteredInvalids,
      };
    },
    removeAllMainImageInvalidValues: (state) => {
      return {
        ...state,
        mainImageInvalidValues: [],
      };
    },
    addMainImageInvalidValue: (state, action: PayloadAction<string[]>) => {
      const updatedInvalids = [...state.mainImageInvalidValues, ...action.payload];

      const removedDuplicatesInvalids = [...updatedInvalids.filter((v, i, a) => v && a.indexOf(v) === i)];

      return {
        ...state,
        mainImageInvalidValues: removedDuplicatesInvalids,
      };
    },
    addMainPicture: (state, action: PayloadAction<MainPictureProps>) => {
      return {
        ...state,
        mainImage: action.payload,
      };
    },
    removeMainPicture: (state) => {
      return {
        ...state,
        mainImage: {} as MainPictureProps,
      };
    },
    setMainPictureAlt: (state, action: PayloadAction<{ language: string; value: string }>) => {
      const updatedMainPic = {
        ...state.mainImage,
        altText: {
          ...state.mainImage?.altText,
          [action.payload.language]: action.payload.value,
        },
      } as MainPictureProps;
      return {
        ...state,
        mainImage: updatedMainPic,
      };
    },
    setMainPictureSource: (state, action: PayloadAction<string>) => {
      const updatedMainImage = {
        ...state.mainImage,
        source: action.payload,
      };
      return {
        ...state,
        mainImage: updatedMainImage as MainPictureProps,
      };
    },
    setCurEditingMainEntranceImageTemp: (state, action: PayloadAction<MainPictureProps>) => {
      return {
        ...state,
        mainImageTemp: action.payload,
      };
    },
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
  setAnsweredChoice,
  removeAnsweredChoice,
  setAnswer,
  setExtraAnswer,
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
  addMainImageElement,
  addMainImageTempElement,
  removeMainImageElement,
  removeMainImageInvalidValue,
  removeAllMainImageInvalidValues,
  addMainImageInvalidValue,
  addMainPicture,
  removeMainPicture,
  setMainPictureAlt,
  setMainPictureSource,
  setCurEditingMainEntranceImageTemp,
} = formSlice.actions;

export default formSlice.reducer;
