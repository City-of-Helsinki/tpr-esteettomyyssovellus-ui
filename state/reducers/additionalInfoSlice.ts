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
    comments: [
      {
        fi: "",
        en: "",
        sv: "",
      },
    ],
    pictures: [
      {
        id: 0,
        base64: "",
        url: "",
        altTextLocales: {
          fi: "",
          en: "",
          sv: "",
        },
      },
    ],
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
    addPicture: (
      state,
      action: PayloadAction<PictureProps>
    ) => {
      const qNumber = action.payload.qNumber 
        return {
          ...state,
          [qNumber]: {
            pictures: [...state[qNumber]?.pictures ?? [], action.payload] 
          }
        }
    },
    removePicture: (
      state,
      action: PayloadAction<{questionNumber: string, currentId: string}>
    ) => {
      const qNumber = action.payload.questionNumber
      const id = action.payload.currentId
      return {
        ...state,
        [qNumber]: {
          pictures: [...state[qNumber].pictures?.filter(item => item.id !== id) ?? []]
        }
      }
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    addComment: (state, action: PayloadAction<number>) => {},
  },
});

export const { addLocation, addPicture, removePicture, addComment } = additionalInfoSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState): number => state.exampleReducer.value;

export default additionalInfoSlice.reducer;
