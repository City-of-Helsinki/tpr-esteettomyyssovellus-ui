import { createSlice, Dictionary, PayloadAction } from "@reduxjs/toolkit";
import { AdditionalInfoProps, AdditionalInfos, PictureProps } from "../../types/general";

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

export const additionalInfoSlice = createSlice({
  name: "additionalInfo",
  initialState: {} as AdditionalInfoProps,
  reducers: {
    clearAddinfoState: (state) => {
      const initState = {} as AdditionalInfoProps;
      return {
        ...initState,
      };
    },
    setInitAdditionalInfoFromDb: (
      state,
      action: PayloadAction<{
        // should be boolean
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
        [qId]: {
          ...state[qId],
          locations: {
            coordinates,
            locNorthing,
            locEasting,
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
        [qId]: {
          ...state[qId],
          locations: {},
        },
      };
    },
    addPicture: (state, action: PayloadAction<PictureProps>) => {
      const { qNumber } = action.payload;
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
    removePicture: (state, action: PayloadAction<{ questionId: number; currentId: number }>) => {
      const qNumber = action.payload.questionId;
      const id = action.payload.currentId;
      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          pictures: [...(state[qNumber].pictures?.filter((picture) => picture.id !== id) ?? [])],
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
      const { type } = action.payload;
      const { id } = action.payload;
      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          components: [...(state[qNumber]?.components ?? []), { id, type }],
        },
      };
    },
    removeComponent: (state, action: PayloadAction<{ questionId: number; delId: number }>) => {
      const qNumber = action.payload.questionId;
      const id = action.payload.delId;
      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          components: [...(state[qNumber]?.components?.filter((elem) => elem.id !== id) ?? [])],
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

      let targetPic = state[qNumber]?.pictures?.find((pic) => pic.id === id);

      if (!targetPic) {
        return { ...state };
      }

      targetPic = { ...targetPic, [lang]: value };

      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          pictures: [...(state[qNumber]?.pictures?.filter((pic) => pic.id !== id) || []), targetPic],
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

      let targetPic = state[qNumber]?.pictures?.find((pic) => pic.id === id);

      if (!targetPic) {
        return { ...state };
      }

      targetPic = { ...targetPic, source };

      return {
        ...state,
        [qNumber]: {
          ...state[qNumber],
          pictures: [...(state[qNumber]?.pictures?.filter((pic) => pic.id !== id) || []), targetPic],
        },
      };
    },
    removeSingleQuestionAdditionalinfo: (state, action: PayloadAction<{ questionId: number }>) => {
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
      const { prevState } = action.payload;
      return {
        ...state,
        [qNumber]: prevState,
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

      const targetInvalid = state[qId]?.invalidValues?.find((invalids) => invalids.id === compId);

      const invalidInitDublicates =
        targetInvalid && targetInvalid?.invalidAnswers && targetInvalid?.invalidAnswers.length > 0
          ? targetInvalid?.invalidAnswers?.concat(values)
          : values;

      // @ts-ignore
      const newInvaRemoveDublicates = [...new Set(invalidInitDublicates)];

      return {
        ...state,
        [qId]: {
          ...state[qId],
          invalidValues: [
            ...(state[qId]?.invalidValues?.filter((invs) => invs.id !== compId) ?? []),
            { id: compId, invalidAnswers: newInvaRemoveDublicates },
          ],
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
      const targetInvalid = state[qId]?.invalidValues?.find((invalids) => invalids.id === compId);
      const newInvalids = targetInvalid ? targetInvalid.invalidAnswers?.filter((val) => val !== remoTarget) : [];
      return {
        ...state,
        [qId]: {
          ...state[qId],
          invalidValues: [...(state[qId].invalidValues?.filter((values) => values.id !== compId) || []), { id: compId, invalidAnswers: newInvalids }],
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
      const invalidTargetRemoved = state[qId]?.invalidValues?.filter((invalids) => invalids.id !== compId);
      return {
        ...state,
        [qId]: {
          ...state[qId],
          invalidValues: invalidTargetRemoved,
        },
      };
    },
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
