import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist";
import { AdditionalInfoStateProps, EntranceLocationPhoto, EntrancePlaceBox, QuestionBlockComment } from "../../types/general";
import { BackendEntranceAnswer } from "../../types/backendModels";

// TODO: maybe delete this before prod
// notice: many [questionNumber] OR [qNumber] is actually questionId

const initialState: AdditionalInfoStateProps = {
  entranceLocationPhoto: {} as EntranceLocationPhoto,
  entranceLocationPhotoValid: true,
  entrancePlaceBoxes: [],
  entrancePlaceValid: true,
  questionBlockComments: [],
  questionBlockCommentValid: true,
};

export const additionalInfoSlice = createSlice({
  name: "additionalInfo",
  initialState,
  reducers: {
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
    editEntranceLocation: (state, action: PayloadAction<{ entrance_id: number; locEasting?: number; locNorthing?: number }>) => {
      return {
        ...state,
        entranceLocationPhoto: {
          ...state.entranceLocationPhoto,
          modifiedAnswer: {
            ...((state.entranceLocationPhoto.modifiedAnswer ?? {}) as BackendEntranceAnswer),
            loc_easting: action.payload.locEasting !== undefined ? Math.round(action.payload.locEasting) : undefined,
            loc_northing: action.payload.locNorthing !== undefined ? Math.round(action.payload.locNorthing) : undefined,
          },
        },
      };
    },
    revertEntranceLocationPhoto: (state, action: PayloadAction<{ entrance_id: number }>) => {
      return {
        ...state,
        entranceLocationPhoto: {
          ...state.entranceLocationPhoto,
          entrance_id: action.payload.entrance_id,
          modifiedAnswer: (state.entranceLocationPhoto.existingAnswer ?? {}) as BackendEntranceAnswer,
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
    editEntrancePlaceBoxLocation: (
      state,
      action: PayloadAction<{
        entrance_id: number;
        place_id: number;
        order_number: number;
        locEasting?: number;
        locNorthing?: number;
      }>
    ) => {
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
                  modifiedBox: {
                    ...box.modifiedBox,
                    loc_easting: action.payload.locEasting !== undefined ? Math.round(action.payload.locEasting) : undefined,
                    loc_northing: action.payload.locNorthing !== undefined ? Math.round(action.payload.locNorthing) : undefined,
                  },
                },
              ]
            : [...acc, box];
        }, []),
      };
    },
    editEntrancePlaceBoxLocationText: (
      state,
      action: PayloadAction<{
        entrance_id: number;
        place_id: number;
        order_number: number;
        language: string;
        locationText?: string;
      }>
    ) => {
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
                  modifiedBox: {
                    ...box.modifiedBox,
                    [`location_text_${action.payload.language}`]: action.payload.locationText,
                  },
                },
              ]
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
    setQuestionBlockComments: (state, action: PayloadAction<QuestionBlockComment[]>) => {
      return { ...state, questionBlockComments: action.payload };
    },
    setQuestionBlockComment: (state, action: PayloadAction<QuestionBlockComment>) => {
      return {
        ...state,
        questionBlockComments: state.questionBlockComments.reduce(
          (acc: QuestionBlockComment[], blockComment) => {
            return blockComment.entrance_id === action.payload.entrance_id && blockComment.question_block_id === action.payload.question_block_id
              ? acc
              : [...acc, blockComment];
          },
          [action.payload]
        ),
      };
    },
    setQuestionBlockCommentValid: (state, action: PayloadAction<boolean>) => {
      return { ...state, questionBlockCommentValid: action.payload };
    },
    editQuestionBlockComment: (
      state,
      action: PayloadAction<{
        entrance_id: number;
        question_block_id: number;
        language: string;
        commentText?: string;
      }>
    ) => {
      return {
        ...state,
        questionBlockComments: state.questionBlockComments.reduce((acc: QuestionBlockComment[], blockComment) => {
          return blockComment.entrance_id === action.payload.entrance_id && blockComment.question_block_id === action.payload.question_block_id
            ? [
                ...acc,
                {
                  ...blockComment,
                  modifiedComment: {
                    ...(blockComment.modifiedComment ?? {}),
                    question_block_id: action.payload.question_block_id,
                    [`comment_text_${action.payload.language}`]: action.payload.commentText,
                  },
                },
              ]
            : [...acc, blockComment];
        }, []),
      };
    },
    removeQuestionBlockComment: (state, action: PayloadAction<{ entrance_id: number; question_block_id: number }>) => {
      return {
        ...state,
        questionBlockComments: state.questionBlockComments.reduce((acc: QuestionBlockComment[], blockComment) => {
          return blockComment.entrance_id === action.payload.entrance_id && blockComment.question_block_id === action.payload.question_block_id
            ? [
                ...acc,
                {
                  ...blockComment,
                  modifiedComment: undefined,
                  invalidValues: [],
                },
              ]
            : [...acc, blockComment];
        }, []),
      };
    },
    revertQuestionBlockComment: (state, action: PayloadAction<{ entrance_id: number; question_block_id: number }>) => {
      return {
        ...state,
        questionBlockComments: state.questionBlockComments.reduce((acc: QuestionBlockComment[], blockComment) => {
          if (blockComment.entrance_id === action.payload.entrance_id && blockComment.question_block_id === action.payload.question_block_id) {
            // Revert this question block comment
            if (blockComment.existingComment !== undefined) {
              // This comment existed before, so revert to the existing values
              return [
                ...acc,
                {
                  ...blockComment,
                  modifiedComment: blockComment.existingComment,
                  invalidValues: [],
                },
              ];
            } else {
              // This comment did not exist before, so remove it
              return acc;
            }
          } else {
            return [...acc, blockComment];
          }
        }, []),
      };
    },
    addInvalidQuestionBlockCommentValue: (
      state,
      action: PayloadAction<{
        entrance_id: number;
        question_block_id: number;
        invalidFieldId: string;
        invalidFieldLabel: string;
      }>
    ) => {
      const validationToAdd = { valid: false, fieldId: action.payload.invalidFieldId, fieldLabel: action.payload.invalidFieldLabel };

      return {
        ...state,
        questionBlockComments: state.questionBlockComments.reduce((acc: QuestionBlockComment[], blockComment) => {
          return blockComment.entrance_id === action.payload.entrance_id && blockComment.question_block_id === action.payload.question_block_id
            ? [
                ...acc,
                {
                  ...blockComment,
                  invalidValues: [...(blockComment.invalidValues ?? []), validationToAdd].filter(
                    (v, i, a) => v && a.findIndex((v2) => v2.fieldId === v.fieldId) === i
                  ),
                },
              ]
            : [...acc, blockComment];
        }, []),
      };
    },
    removeInvalidQuestionBlockCommentValue: (
      state,
      action: PayloadAction<{
        entrance_id: number;
        question_block_id: number;
        invalidFieldIdToRemove: string;
      }>
    ) => {
      return {
        ...state,
        questionBlockComments: state.questionBlockComments.reduce((acc: QuestionBlockComment[], blockComment) => {
          return blockComment.entrance_id === action.payload.entrance_id && blockComment.question_block_id === action.payload.question_block_id
            ? [
                ...acc,
                {
                  ...blockComment,
                  invalidValues: (blockComment.invalidValues ?? []).filter((val) => val.fieldId !== action.payload.invalidFieldIdToRemove),
                },
              ]
            : [...acc, blockComment];
        }, []),
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
  setEntranceLocationPhoto,
  setEntranceLocationPhotoValid,
  editEntranceLocationPhoto,
  editEntranceLocation,
  revertEntranceLocationPhoto,
  addInvalidEntranceLocationPhotoValue,
  removeInvalidEntranceLocationPhotoValue,
  setEntrancePlaceBoxes,
  setEntrancePlaceValid,
  addEntrancePlaceBox,
  editEntrancePlaceBox,
  editEntrancePlaceBoxLocation,
  editEntrancePlaceBoxLocationText,
  changeEntrancePlaceBoxOrder,
  deleteEntrancePlaceBox,
  deleteEntrancePlace,
  revertEntrancePlace,
  addInvalidEntrancePlaceBoxValue,
  removeInvalidEntrancePlaceBoxValue,
  setQuestionBlockComments,
  setQuestionBlockComment,
  setQuestionBlockCommentValid,
  editQuestionBlockComment,
  removeQuestionBlockComment,
  revertQuestionBlockComment,
  addInvalidQuestionBlockCommentValue,
  removeInvalidQuestionBlockCommentValue,
} = additionalInfoSlice.actions;

// Other code such as selectors can use the imported `RootState` type

export default additionalInfoSlice.reducer;
