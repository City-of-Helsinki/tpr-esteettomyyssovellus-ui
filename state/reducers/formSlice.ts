import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface formState {
  currentServicepointId: number;
  currentEntranceId: number;
  answeredChoices: string[];
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
  formFinished: false
};

export const formSlice = createSlice({
  name: "mainForm",
  initialState,
  reducers: {
    setServicepointId: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        currentServicepointId: action.payload
      };
    },
    setEntranceId: (state, action: PayloadAction<number>) => {
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
    initForm: (state) => {
      return {
        ...state,
        formInited: true
      };
    },
    setFinished: (state, action: PayloadAction<number>) => {
      if (!state.finishedBlocks.includes(action.payload)) {
        return {
          ...state,
          finishedBlocks: [...state.finishedBlocks, action.payload]
        };
      } else {
        return {
          ...state
        };
      }
    },
    unsetFinished: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        finishedBlocks: [
          ...(state.finishedBlocks?.filter((elem) => elem != action.payload) ??
            [])
        ]
      };
    },
    setContactPerson: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        contacts: {
          ...state.contacts,
          // Sets the contact person. The contact person is always valid at the start
          // and changes to invalid if the validation fails
          ["contactPerson"]: [action.payload, false]
        }
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
          ["phoneNumber"]: [action.payload, false]
        }
      };
    },
    setEmail: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        // Sets the email. The email is always valid at the start
        // and changes to invalid if the validation fails
        contacts: { ...state.contacts, ["email"]: [action.payload, false] }
      };
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        startedAnswering: action.payload
      };
    },
    changeContactPersonStatus: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        contacts: {
          ...state.contacts,
          ["contactPerson"]: [
            state.contacts["contactPerson"][0],
            action.payload
          ]
        }
      };
    },
    changePhoneNumberStatus: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        contacts: {
          ...state.contacts,
          ["phoneNumber"]: [state.contacts["phoneNumber"][0], action.payload]
        }
      };
    },
    changeEmailStatus: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        contacts: {
          ...state.contacts,
          ["email"]: [state.contacts["email"][0], action.payload]
        }
      };
    },
    setInvalid: (state, action: PayloadAction<number>) => {
      if (!state.invalidBlocks.includes(action.payload)) {
        return {
          ...state,
          invalidBlocks: [...state.invalidBlocks, action.payload]
        };
      } else {
        return {
          ...state
        };
      }
    },
    unsetInvalid: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        invalidBlocks: [
          ...(state.invalidBlocks?.filter((elem) => elem != action.payload) ??
            [])
        ]
      };
    },
    setFormFinished: (state) => {
      return {
        ...state,
        formFinished: true
      };
    },
    unsetFormFinished: (state) => {
      return {
        ...state,
        formFinished: false
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
  unsetFormFinished
} = formSlice.actions;

export default formSlice.reducer;
