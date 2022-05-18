import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { AdditionalInfoProps, AdditionalInfoStateProps, EntranceLocationPhoto, EntrancePlaceBox, PictureProps } from "../../types/general";

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
  entranceLocationPhoto: {} as EntranceLocationPhoto,
  entranceLocationPhotoValid: true,
  entrancePlaceBoxes: [],
  entrancePlaceValid: true,
};

export const additionalInfoSlice = createSlice({
  name: "additionalInfo",
  initialState,
  reducers: {
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
    setEntranceLocationPhoto: (state, action: PayloadAction<EntranceLocationPhoto>) => {
      return { ...state, entranceLocationPhoto: action.payload };
    },
    setEntranceLocationPhotoValid: (state, action: PayloadAction<boolean>) => {
      return { ...state, entranceLocationPhotoValid: action.payload };
    },
    editEntranceLocationPhoto: (state, action: PayloadAction<{ entrance_id: number; updatedLocationPhoto: EntranceLocationPhoto }>) => {
      return {
        ...state,
        entranceLocationPhoto: { ...state.entranceLocationPhoto, ...action.payload.updatedLocationPhoto },
      };
    },
    revertEntranceLocationPhoto: (state, action: PayloadAction<{ entrance_id: number }>) => {
      return {
        ...state,
        entranceLocationPhoto: {
          ...state.entranceLocationPhoto,
          entrance_id: action.payload.entrance_id,
          modifiedAnswer: state.entranceLocationPhoto.existingAnswer,
          modifiedPhotoBase64: state.entranceLocationPhoto.existingPhotoBase64,
          invalidValues: [],
        },
      };
    },
    addInvalidEntranceLocationPhotoValue: (
      state,
      action: PayloadAction<{
        entrance_id: number;
        invalidFieldId: string;
        invalidFieldLabel: string;
      }>
    ) => {
      const validationToAdd = { valid: false, fieldId: action.payload.invalidFieldId, fieldLabel: action.payload.invalidFieldLabel };

      return {
        ...state,
        entranceLocationPhoto: {
          ...state.entranceLocationPhoto,
          invalidValues: [...(state.entranceLocationPhoto.invalidValues ?? []), validationToAdd].filter(
            (v, i, a) => v && a.findIndex((v2) => v2.fieldId === v.fieldId) === i
          ),
        },
      };
    },
    removeInvalidEntranceLocationPhotoValue: (state, action: PayloadAction<{ entrance_id: number; invalidFieldIdToRemove: string }>) => {
      return {
        ...state,
        entranceLocationPhoto: {
          ...state.entranceLocationPhoto,
          invalidValues: [
            ...(state.entranceLocationPhoto.invalidValues ?? []).filter((val) => val.fieldId !== action.payload.invalidFieldIdToRemove),
          ],
        },
      };
    },
    setEntrancePlaceBoxes: (state, action: PayloadAction<EntrancePlaceBox[]>) => {
      return { ...state, entrancePlaceBoxes: action.payload };
    },
    setEntrancePlaceValid: (state, action: PayloadAction<boolean>) => {
      return { ...state, entrancePlaceValid: action.payload };
    },
    addEntrancePlaceBox: (state, action: PayloadAction<EntrancePlaceBox>) => {
      return { ...state, entrancePlaceBoxes: [...(state.entrancePlaceBoxes ?? []), action.payload] };
    },
    editEntrancePlaceBox: (
      state,
      action: PayloadAction<{
        entrance_id: number;
        place_id: number;
        order_number: number;
        updatedPlaceBox: EntrancePlaceBox;
      }>
    ) => {
      return {
        ...state,
        entrancePlaceBoxes: state.entrancePlaceBoxes.reduce((acc: EntrancePlaceBox[], box) => {
          return box.entrance_id === action.payload.entrance_id &&
            box.place_id === action.payload.place_id &&
            box.order_number === action.payload.order_number &&
            !box.isDeleted
            ? [...acc, action.payload.updatedPlaceBox]
            : [...acc, box];
        }, []),
      };
    },
    changeEntrancePlaceBoxOrder: (
      state,
      action: PayloadAction<{
        entrance_id: number;
        place_id: number;
        order_number: number;
        difference: number;
      }>
    ) => {
      // Count the boxes for this entrance place
      const boxCount = state.entrancePlaceBoxes.filter(
        (box) => box.entrance_id === action.payload.entrance_id && box.place_id === action.payload.place_id
      );

      return {
        ...state,
        entrancePlaceBoxes: state.entrancePlaceBoxes.reduce((acc: EntrancePlaceBox[], box) => {
          // Swap the order numbers of the two boxes
          // The difference value is +1 or -1 depending on which arrow was clicked
          const box1 = action.payload.order_number;
          const box2 = action.payload.order_number + action.payload.difference;

          if (
            box.entrance_id === action.payload.entrance_id &&
            box.place_id === action.payload.place_id &&
            (box.order_number === box1 || box.order_number === box2)
          ) {
            if (box1 >= 1 && box2 >= 1 && box1 <= boxCount.length && box2 <= boxCount.length) {
              // The order numbers are within the limits, so ok to swap
              const newOrder =
                box.order_number === box1 ? box.order_number + action.payload.difference : box.order_number - action.payload.difference;
              return [...acc, { ...box, order_number: newOrder }];
            } else {
              return [...acc, box];
            }
          } else {
            return [...acc, box];
          }
        }, []),
      };
    },
    deleteEntrancePlaceBox: (state, action: PayloadAction<{ entrance_id: number; place_id: number; order_number: number }>) => {
      // Mark the box as deleted, and update the order numbers of the rest for this entrance place
      return {
        ...state,
        entrancePlaceBoxes: state.entrancePlaceBoxes.reduce((acc: EntrancePlaceBox[], box) => {
          if (box.entrance_id === action.payload.entrance_id && box.place_id === action.payload.place_id) {
            return box.order_number === action.payload.order_number
              ? [...acc, { ...box, isDeleted: true }]
              : [...acc, { ...box, order_number: box.order_number > action.payload.order_number ? box.order_number - 1 : box.order_number }];
          } else {
            return [...acc, box];
          }
        }, []),
      };
    },
    deleteEntrancePlace: (state, action: PayloadAction<{ entrance_id: number; place_id: number }>) => {
      // Mark all boxes as deleted for this entrance place
      return {
        ...state,
        entrancePlaceBoxes: state.entrancePlaceBoxes.reduce((acc: EntrancePlaceBox[], box) => {
          if (box.entrance_id === action.payload.entrance_id && box.place_id === action.payload.place_id) {
            return [...acc, { ...box, isDeleted: true }];
          } else {
            return [...acc, box];
          }
        }, []),
      };
    },
    revertEntrancePlace: (state, action: PayloadAction<{ entrance_id: number; place_id: number }>) => {
      return {
        ...state,
        entrancePlaceBoxes: state.entrancePlaceBoxes.reduce((acc: EntrancePlaceBox[], box) => {
          if (box.entrance_id === action.payload.entrance_id && box.place_id === action.payload.place_id) {
            // Revert this entrance place box
            if (box.existingBox !== undefined) {
              // This box existed before, so revert to the existing values
              // Try to make sure the order number is 1 or higher
              return [
                ...acc,
                {
                  ...box,
                  order_number: box.order_number > 0 ? box.order_number : 1,
                  modifiedBox: box.existingBox,
                  modifiedPhotoBase64: box.existingPhotoBase64,
                  // isDeleted: false,
                  invalidValues: [],
                },
              ];
            } else {
              // This box did not exist before, so remove it
              return acc;
            }
          } else {
            return [...acc, box];
          }
        }, []),
      };
    },
    addInvalidEntrancePlaceBoxValue: (
      state,
      action: PayloadAction<{
        entrance_id: number;
        place_id: number;
        order_number: number;
        invalidFieldId: string;
        invalidFieldLabel: string;
      }>
    ) => {
      const validationToAdd = { valid: false, fieldId: action.payload.invalidFieldId, fieldLabel: action.payload.invalidFieldLabel };

      return {
        ...state,
        entrancePlaceBoxes: state.entrancePlaceBoxes.reduce((acc: EntrancePlaceBox[], box) => {
          return box.entrance_id === action.payload.entrance_id &&
            box.place_id === action.payload.place_id &&
            box.order_number === action.payload.order_number &&
            !box.isDeleted
            ? [
                ...acc,
                {
                  ...box,
                  invalidValues: [...(box.invalidValues ?? []), validationToAdd].filter(
                    (v, i, a) => v && a.findIndex((v2) => v2.fieldId === v.fieldId) === i
                  ),
                },
              ]
            : [...acc, box];
        }, []),
      };
    },
    removeInvalidEntrancePlaceBoxValue: (
      state,
      action: PayloadAction<{
        entrance_id: number;
        place_id: number;
        order_number: number;
        invalidFieldIdToRemove: string;
      }>
    ) => {
      return {
        ...state,
        entrancePlaceBoxes: state.entrancePlaceBoxes.reduce((acc: EntrancePlaceBox[], box) => {
          return box.entrance_id === action.payload.entrance_id &&
            box.place_id === action.payload.place_id &&
            box.order_number === action.payload.order_number &&
            !box.isDeleted
            ? [...acc, { ...box, invalidValues: (box.invalidValues ?? []).filter((val) => val.fieldId !== action.payload.invalidFieldIdToRemove) }]
            : [...acc, box];
        }, []),
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
        coordinates: [number, number];
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
  setEntranceLocationPhoto,
  setEntranceLocationPhotoValid,
  editEntranceLocationPhoto,
  revertEntranceLocationPhoto,
  addInvalidEntranceLocationPhotoValue,
  removeInvalidEntranceLocationPhotoValue,
  setEntrancePlaceBoxes,
  setEntrancePlaceValid,
  addEntrancePlaceBox,
  editEntrancePlaceBox,
  changeEntrancePlaceBoxOrder,
  deleteEntrancePlaceBox,
  deleteEntrancePlace,
  revertEntrancePlace,
  addInvalidEntrancePlaceBoxValue,
  removeInvalidEntrancePlaceBoxValue,
} = additionalInfoSlice.actions;

// Other code such as selectors can use the imported `RootState` type

export default additionalInfoSlice.reducer;
