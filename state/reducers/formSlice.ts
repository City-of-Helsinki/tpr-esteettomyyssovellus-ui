import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { MainPictureProps } from "../../types/general";

interface formState {
  currentServicepointId: number;
  currentEntranceId: number;
  answeredChoices: number[];
  answers: { [key: number]: number };
  isContinueClicked: boolean;
  finishedBlocks: number[];
  // A dictionary of all the necessary contact information.
  // The arrays corresponding to the keys have the value and a boolean which
  // indicates wheter the value is valid.
  contacts: { [key: string]: [string, boolean] };
  startedAnswering: string;
  invalidBlocks: number[];
  formInited: boolean;
  formFinished: boolean;
  formSubmitted: boolean;
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
  isContinueClicked: false,
  finishedBlocks: [],
  contacts: {},
  startedAnswering: "",
  invalidBlocks: [],
  formInited: false,
  formFinished: false,
  formSubmitted: false,
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
    clearFormState: () => {
      return {
        ...initialState,
      };
    },
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
    setAnswer: (state, action: PayloadAction<{ questionNumber: number; answer: number }>) => {
      const qNumber = action.payload.questionNumber;
      const a = action.payload.answer;
      return {
        ...state,
        answers: { ...state.answers, [qNumber]: a },
      };
    },
    setContinue: (state) => {
      return {
        ...state,
        isContinueClicked: true,
      };
    },
    unsetContinue: (state) => {
      return {
        ...state,
        isContinueClicked: false,
      };
    },
    initForm: (state) => {
      return {
        ...state,
        formInited: true,
      };
    },
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
    setContactPerson: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        contacts: {
          ...state.contacts,
          // Sets the contact person. The contact person is always valid at the start
          // and changes to invalid if the validation fails
          contactPerson: [action.payload, false],
        },
      };
    },
    setPhoneNumber: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        contacts: {
          ...state.contacts,
          // Sets the phone number. The phone number is always valid at the start
          // and changes to invalid if the validation fails. TODO: POSSIBLY VALIDATE
          // WHEN SET
          phoneNumber: [action.payload, false],
        },
      };
    },
    setEmail: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        // Sets the email. The email is always valid at the start
        // and changes to invalid if the validation fails
        contacts: { ...state.contacts, email: [action.payload, false] },
      };
    },
    setWwwAddress: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        // Sets the email. The email is always valid at the start
        // and changes to invalid if the validation fails
        contacts: { ...state.contacts, www: [action.payload, false] },
      };
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        startedAnswering: action.payload,
      };
    },
    changeContactPersonStatus: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        contacts: {
          ...state.contacts,
          contactPerson: [state.contacts.contactPerson[0], action.payload],
        },
      };
    },
    changePhoneNumberStatus: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        contacts: {
          ...state.contacts,
          phoneNumber: [state.contacts.phoneNumber[0], action.payload],
        },
      };
    },
    changeEmailStatus: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        contacts: {
          ...state.contacts,
          email: [state.contacts.email[0], action.payload],
        },
      };
    },
    changeWwwStatus: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        contacts: {
          ...state.contacts,
          www: [state.contacts.www[0], action.payload],
        },
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
    setFormSubmitted: (state) => {
      return {
        ...state,
        formSubmitted: true,
      };
    },
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
});
export const {
  clearFormState,
  setServicepointId,
  setEntranceId,
  setAnsweredChoice,
  removeAnsweredChoice,
  setAnswer,
  setContinue,
  unsetContinue,
  setFinished,
  unsetFinished,
  setContactPerson,
  setPhoneNumber,
  setEmail,
  setStartDate,
  changeContactPersonStatus,
  changePhoneNumberStatus,
  changeEmailStatus,
  setInvalid,
  unsetInvalid,
  initForm,
  setFormFinished,
  unsetFormFinished,
  setWwwAddress,
  changeWwwStatus,
  setFormSubmitted,
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
