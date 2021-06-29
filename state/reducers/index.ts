import { AnyAction, combineReducers } from "redux";
import general from "./general";
import additionalInfoSlice from "./additionalInfoSlice";
import { CLEAR_STATE } from "../../types/constants";

const appReducer = combineReducers({ general, additionalInfoSlice});

export type RootState = ReturnType<typeof appReducer>;

export const rootReducer = (state: RootState | undefined, action: AnyAction): RootState => {
  if (action.type === CLEAR_STATE) {
    // Return to initial state
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};
