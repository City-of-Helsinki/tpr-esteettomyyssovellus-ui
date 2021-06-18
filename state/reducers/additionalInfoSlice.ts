import { createSlice, Dictionary, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { AdditionalInfoProps, PictureProps } from "../../types/general";
import { LatLngExpression } from "leaflet";

// TODO: wait for customer / designs then complete this state
const initialState = {
  questionNumbers: {
    locations: [
      {
        description: "",
        coordinates: null,
      },
    ],
    comments: {
      comment_fi: "",
      comment_en: "",
      comment_sv: "",
    },
    pictures: [
      {
        id: 0,
        base: "",
        url: "",
        alt_fi: "",
        alt_en: "",
        alt_sv: "",
      },
    ],
    components: [],
  },
};

export const additionalInfoSlice = createSlice({
  name: "additionalInfo",
  initialState: {} as AdditionalInfoProps,
  reducers: {
    addLocation: (
      state,
      action: PayloadAction<{
        questionNumber: string;
        description: string;
        coordinates: LatLngExpression;
      }>
    ) => {
      // TODO: set state and change payload (?)
    },
    addPicture: (state, action: PayloadAction<PictureProps>) => {
      const qNumber = action.payload.qNumber;
      return {
        [qNumber]: {
          ...state[qNumber],
          pictures: [...(state[qNumber]?.pictures ?? []), action.payload],
        },
      };
    },
    removeComment: (state, action: PayloadAction<{ questionNumber: string }>) => {
      const qNumber = action.payload.questionNumber;
      return {
        [qNumber]: {
          ...state[qNumber],
          comments: {},
        },
      };
    },
    removePicture: (state, action: PayloadAction<{ questionNumber: string; currentId: number }>) => {
      const qNumber = action.payload.questionNumber;
      const id = action.payload.currentId;
      return {
        [qNumber]: {
          ...state[qNumber],
          pictures: [...(state[qNumber].pictures?.filter((picture) => picture.id !== id) ?? [])],
        },
      };
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    addComment: (state, action: PayloadAction<{ questionNumber: string; language: string; value: string }>) => {
      const qNumber = action.payload.questionNumber;
      const lang = action.payload.language;
      const value = action.payload.value;

      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          comments: { ...state[qNumber].comments, [lang]: value },
        },
      };
    },
    addComponent: (state, action: PayloadAction<{ questionNumber: string; type: string; id: number }>) => {
      const qNumber = action.payload.questionNumber;
      const type = action.payload.type;
      const id = action.payload.id;
      return {
        [qNumber]: {
          ...state[qNumber],
          components: [...(state[qNumber]?.components ?? []), { id: id, type: type }],
        },
      };
    },
    removeComponent: (state, action: PayloadAction<{ questionNumber: string; delId: number }>) => {
      const qNumber = action.payload.questionNumber;
      const id = action.payload.delId;
      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          components: [...(state[qNumber]?.components?.filter((elem) => elem.id !== id) ?? [])],
        },
      };
    },
    setAlt: (state, action: PayloadAction<{ questionNumber: string; language: string; value: string; compId: number }>) => {
      const qNumber = action.payload.questionNumber;
      const lang = action.payload.language;
      const value = action.payload.value;
      const id = action.payload.compId;

      let targetPic = state[qNumber].pictures?.find((pic) => pic.id === id);

      if (!targetPic) {
        return { ...state };
      }

      targetPic = { ...targetPic, [lang]: value };

      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          pictures: [...(state[qNumber].pictures?.filter((pic) => pic.id !== id) || []), targetPic],
        },
      };
    },
    setPictureSource: (state, action: PayloadAction<{ questionNumber: string; compId: number; source: string }>) => {
      const qNumber = action.payload.questionNumber;
      const source = action.payload.source;
      const id = action.payload.compId;

      let targetPic = state[qNumber].pictures?.find((pic) => pic.id === id);

      if (!targetPic) {
        return { ...state };
      }

      targetPic = { ...targetPic, source: source };

      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          pictures: [...(state[qNumber].pictures?.filter((pic) => pic.id !== id) || []), targetPic],
        },
      };
    },
  },
});

export const {
  addLocation,
  addPicture,
  removePicture,
  addComment,
  addComponent,
  removeComponent,
  setAlt,
  setPictureSource,
  removeComment,
} = additionalInfoSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState): number => state.exampleReducer.value;

export default additionalInfoSlice.reducer;
