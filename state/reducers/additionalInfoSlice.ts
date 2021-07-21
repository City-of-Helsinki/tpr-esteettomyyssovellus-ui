import { createSlice, Dictionary, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import {
  AdditionalInfoProps,
  AdditionalInfos,
  PictureProps,
} from "../../types/general";
import { LatLngExpression } from "leaflet";

// TODO: wait for customer / designs then complete this state
// notice: many [questionNumber] OR [qNumber] is actually questionId
// const initialState = {
//   initAddInfoFromDb: false,
//   curEditingInitialState: null,
//   questionNumbers: {
//     locations: [
//       {
//         description: "",
//         coordinates: null,
//       },
//     ],
//     comments: {
//       comment_fi: "",
//       comment_en: "",
//       comment_sv: "",
//     },
//     pictures: [
//       {
//         id: 0,
//         base: "",
//         url: "",
//         alt_fi: "",
//         alt_en: "",
//         alt_sv: "",
//       },
//     ],
//     components: [],
//   },
// };

export const additionalInfoSlice = createSlice({
  name: "additionalInfo",
  initialState: {} as AdditionalInfoProps,
  reducers: {
    setInitAdditionalInfoFromDb: (
      state,
      action: PayloadAction<{
        //should be boolean
        isInited: any;
      }>
    ) => {
      return {
        ...state,
        initAddInfoFromDb: action.payload.isInited,
      };
    },
    setEditingInitialState: (
      state,
      action: PayloadAction<{
        obj: any;
      }>
    ) => {
      const obj = action.payload.obj;
      return {
        ...state,
        curEditingInitialState: obj,
      };
    },
    clearEditingInitialState: (state) => {
      return {
        ...state,
        curEditingInitialState: {},
      };
    },
    addLocation: (
      state,
      action: PayloadAction<{
        questionId: number;
        description: string;
        coordinates: LatLngExpression;
      }>
    ) => {
      // TODO: set state and change payload (?)
      return {
        ...state,
      };
    },
    addPicture: (state, action: PayloadAction<PictureProps>) => {
      const qNumber = action.payload.qNumber;
      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          pictures: [...(state[qNumber]?.pictures ?? []), action.payload],
        },
      };
    },
    removeComment: (state, action: PayloadAction<{ questionId: number }>) => {
      const qNumber = action.payload.questionId;
      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          comments: {},
        },
      };
    },
    removePicture: (
      state,
      action: PayloadAction<{ questionId: number; currentId: number }>
    ) => {
      const qNumber = action.payload.questionId;
      const id = action.payload.currentId;
      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          pictures: [
            ...(state[qNumber].pictures?.filter(
              (picture) => picture.id !== id
            ) ?? []),
          ],
        },
      };
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    addComment: (
      state,
      action: PayloadAction<{
        questionId: number;
        language: string;
        value: string;
      }>
    ) => {
      const qNumber = action.payload.questionId;
      const lang = action.payload.language;
      const value = action.payload.value;

      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          comments: { ...state[qNumber]?.comments, [lang]: value },
        },
      };
    },
    addComponent: (
      state,
      action: PayloadAction<{
        questionId: number;
        type: string;
        id: number;
      }>
    ) => {
      const qNumber = action.payload.questionId;
      const type = action.payload.type;
      const id = action.payload.id;
      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          components: [
            ...(state[qNumber]?.components ?? []),
            { id: id, type: type },
          ],
        },
      };
    },
    removeComponent: (
      state,
      action: PayloadAction<{ questionId: number; delId: number }>
    ) => {
      const qNumber = action.payload.questionId;
      const id = action.payload.delId;
      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          components: [
            ...(state[qNumber]?.components?.filter((elem) => elem.id !== id) ??
              []),
          ],
        },
      };
    },
    setAlt: (
      state,
      action: PayloadAction<{
        questionId: number;
        language: string;
        value: string;
        compId: number;
      }>
    ) => {
      const qNumber = action.payload.questionId;
      const lang = action.payload.language;
      const value = action.payload.value;
      const id = action.payload.compId;

      let targetPic = state[qNumber]?.pictures?.find((pic) => pic.id === id);

      if (!targetPic) {
        return { ...state };
      }

      targetPic = { ...targetPic, [lang]: value };

      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          pictures: [
            ...(state[qNumber]?.pictures?.filter((pic) => pic.id !== id) || []),
            targetPic,
          ],
        },
      };
    },
    setPictureSource: (
      state,
      action: PayloadAction<{
        questionId: number;
        compId: number;
        source: string;
      }>
    ) => {
      const qNumber = action.payload.questionId;
      const source = action.payload.source;
      const id = action.payload.compId;

      let targetPic = state[qNumber]?.pictures?.find((pic) => pic.id === id);

      if (!targetPic) {
        return { ...state };
      }

      targetPic = { ...targetPic, source: source };

      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          pictures: [
            ...(state[qNumber]?.pictures?.filter((pic) => pic.id !== id) || []),
            targetPic,
          ],
        },
      };
    },
    removeSingleQuestionAdditionalinfo: (
      state,
      action: PayloadAction<{ questionId: number }>
    ) => {
      const qNumber = action.payload.questionId;
      return {
        ...state,
        [qNumber]: {},
      };
    },
    setPreviousInitStateAdditionalinfo: (
      state,
      action: PayloadAction<{
        questionId: number;
        prevState: Dictionary<AdditionalInfos>;
      }>
    ) => {
      const qNumber = action.payload.questionId;
      const prevState = action.payload.prevState;
      return {
        ...state,
        [qNumber]: prevState,
      };
    },
  },
});

export const {
  setEditingInitialState,
  clearEditingInitialState,
  addLocation,
  addPicture,
  removePicture,
  addComment,
  addComponent,
  removeComponent,
  setAlt,
  setPictureSource,
  removeComment,
  removeSingleQuestionAdditionalinfo,
  setPreviousInitStateAdditionalinfo,
  setInitAdditionalInfoFromDb,
} = additionalInfoSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState): number =>
  state.exampleReducer.value;

export default additionalInfoSlice.reducer;
