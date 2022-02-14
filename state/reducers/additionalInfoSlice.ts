import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { AdditionalInfoProps, AdditionalInfoStateProps, PictureProps } from "../../types/general";

// TODO: maybe delete this before prod
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
const initialState: AdditionalInfoStateProps = {
  initAddInfoFromDb: false,
  curEditingInitialState: {},
  additionalInfo: {},
};

export const additionalInfoSlice = createSlice({
  name: "additionalInfo",
  initialState,
  reducers: {
    clearAddinfoState: () => {
      return {
        ...initialState,
      };
    },
    setInitAdditionalInfoFromDb: (
      state,
      action: PayloadAction<{
        isInited: boolean;
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
        obj: AdditionalInfoProps;
      }>
    ) => {
      const { obj } = action.payload;
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
        coordinates: [number, number] | number[];
        locNorthing: number;
        locEasting: number;
      }>
    ) => {
      // TODO: set state and change payload (?)
      const qId = action.payload.questionId;
      const { coordinates } = action.payload;
      const { locNorthing } = action.payload;
      const { locEasting } = action.payload;
      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qId]: {
            ...state.additionalInfo[qId],
            locations: {
              coordinates,
              locNorthing,
              locEasting,
            },
          },
        },
      };
    },
    removeLocation: (
      state,
      action: PayloadAction<{
        questionId: number;
      }>
    ) => {
      const qId = action.payload.questionId;
      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qId]: {
            ...state.additionalInfo[qId],
            locations: {},
          },
        },
      };
    },
    addPicture: (state, action: PayloadAction<PictureProps>) => {
      const { qNumber } = action.payload;
      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qNumber]: {
            ...state.additionalInfo[qNumber],
            pictures: [...(state.additionalInfo[qNumber]?.pictures ?? []), action.payload],
          },
        },
      };
    },
    removeComment: (state, action: PayloadAction<{ questionId: number }>) => {
      const qNumber = action.payload.questionId;
      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qNumber]: {
            ...state.additionalInfo[qNumber],
            comments: {},
          },
        },
      };
    },
    removePicture: (state, action: PayloadAction<{ questionId: number; currentId: number }>) => {
      const qNumber = action.payload.questionId;
      const id = action.payload.currentId;
      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qNumber]: {
            ...state.additionalInfo[qNumber],
            pictures: [...(state.additionalInfo[qNumber].pictures?.filter((picture) => picture.id !== id) ?? [])],
          },
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
      const { value } = action.payload;

      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qNumber]: {
            ...state.additionalInfo[qNumber],
            comments: { ...state.additionalInfo[qNumber]?.comments, [lang]: value },
          },
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
      const { type } = action.payload;
      const { id } = action.payload;
      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qNumber]: {
            ...state.additionalInfo[qNumber],
            components: [...(state.additionalInfo[qNumber]?.components ?? []), { id, type }],
          },
        },
      };
    },
    removeComponent: (state, action: PayloadAction<{ questionId: number; delId: number }>) => {
      const qNumber = action.payload.questionId;
      const id = action.payload.delId;
      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qNumber]: {
            ...state.additionalInfo[qNumber],
            components: [...(state.additionalInfo[qNumber]?.components?.filter((elem) => elem.id !== id) ?? [])],
          },
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
      const { value } = action.payload;
      const id = action.payload.compId;

      let targetPic = state.additionalInfo[qNumber]?.pictures?.find((pic) => pic.id === id);

      if (!targetPic) {
        return { ...state };
      }

      targetPic = {
        ...targetPic,
        altText: {
          ...targetPic.altText,
          [lang]: value,
        },
      };

      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qNumber]: {
            ...state.additionalInfo[qNumber],
            pictures: [...(state.additionalInfo[qNumber]?.pictures?.filter((pic) => pic.id !== id) || []), targetPic],
          },
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
      const { source } = action.payload;
      const id = action.payload.compId;

      let targetPic = state.additionalInfo[qNumber]?.pictures?.find((pic) => pic.id === id);

      if (!targetPic) {
        return { ...state };
      }

      targetPic = { ...targetPic, source };

      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qNumber]: {
            ...state.additionalInfo[qNumber],
            pictures: [...(state.additionalInfo[qNumber]?.pictures?.filter((pic) => pic.id !== id) || []), targetPic],
          },
        },
      };
    },
    removeSingleQuestionAdditionalinfo: (state, action: PayloadAction<{ questionId: number }>) => {
      const qNumber = action.payload.questionId;
      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qNumber]: {},
        },
      };
    },
    setPreviousInitStateAdditionalinfo: (
      state,
      action: PayloadAction<{
        questionId: number;
        prevState: AdditionalInfoProps;
      }>
    ) => {
      const qNumber = action.payload.questionId;
      const { prevState } = action.payload;
      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qNumber]: prevState,
        },
      };
    },
    addInvalidValues: (
      state,
      action: PayloadAction<{
        questionId: number;
        compId: number;
        invalidAnswers: string[];
      }>
    ) => {
      const qId = action.payload.questionId;
      const { compId } = action.payload;
      const values = action.payload.invalidAnswers;

      const targetInvalid = state.additionalInfo[qId]?.invalidValues?.find((invalids) => invalids.id === compId);

      const invalidInitDuplicates =
        targetInvalid && targetInvalid?.invalidAnswers && targetInvalid?.invalidAnswers.length > 0
          ? targetInvalid?.invalidAnswers?.concat(values)
          : values;

      const newInvaRemoveDuplicates = [...invalidInitDuplicates.filter((v, i, a) => v && a.indexOf(v) === i)];

      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qId]: {
            ...state.additionalInfo[qId],
            invalidValues: [
              ...(state.additionalInfo[qId]?.invalidValues?.filter((invs) => invs.id !== compId) ?? []),
              { id: compId, invalidAnswers: newInvaRemoveDuplicates },
            ],
          },
        },
      };
    },
    removeInvalidValues: (
      state,
      action: PayloadAction<{
        questionId: number;
        compId: number;
        removeTarget: string;
      }>
    ) => {
      const qId = action.payload.questionId;
      const { compId } = action.payload;
      const remoTarget = action.payload.removeTarget;
      const targetInvalid = state.additionalInfo[qId]?.invalidValues?.find((invalids) => invalids.id === compId);
      const newInvalids = targetInvalid ? targetInvalid.invalidAnswers?.filter((val) => val !== remoTarget) : [];
      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qId]: {
            ...state.additionalInfo[qId],
            invalidValues: [
              ...(state.additionalInfo[qId].invalidValues?.filter((values) => values.id !== compId) || []),
              { id: compId, invalidAnswers: newInvalids },
            ],
          },
        },
      };
    },
    removeAllInvalids: (
      state,
      action: PayloadAction<{
        questionId: number;
        compId: number;
      }>
    ) => {
      const qId = action.payload.questionId;
      const { compId } = action.payload;
      const invalidTargetRemoved = state.additionalInfo[qId]?.invalidValues?.filter((invalids) => invalids.id !== compId);
      return {
        ...state,
        additionalInfo: {
          ...state.additionalInfo,
          [qId]: {
            ...state.additionalInfo[qId],
            invalidValues: invalidTargetRemoved,
          },
        },
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
  clearAddinfoState,
  setEditingInitialState,
  clearEditingInitialState,
  addLocation,
  removeLocation,
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
  removeAllInvalids,
  removeInvalidValues,
  addInvalidValues,
} = additionalInfoSlice.actions;

// Other code such as selectors can use the imported `RootState` type

export default additionalInfoSlice.reducer;
