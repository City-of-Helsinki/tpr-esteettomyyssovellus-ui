import exampleSlice from "./reducers/exampleSlice";
import additionalInfoSlice from "./reducers/additionalInfoSlice";
import general from "./reducers/general";
import { useMemo } from "react";
import { useDispatch} from "react-redux";
import { Store, createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { RootState, rootReducer } from "./reducers";

let store: Store<RootState> | undefined;

const configureStore = (initialState?: RootState): Store<RootState> => {
  return createStore(rootReducer, initialState, applyMiddleware(thunkMiddleware));
};

export const initStore = (preloadedState?: RootState): Store<RootState> => {
  let newStore = store || configureStore(preloadedState);

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    newStore = configureStore({
      ...store.getState(),
      ...preloadedState,
    });
    // Reset the current store
    store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === "undefined") {
    return newStore;
  }
  // Create the store once in the client
  if (!store) {
    store = newStore;
  }

  return newStore;
};

export const useStore = (initialState?: RootState): Store<RootState> => {
  return useMemo(() => initStore(initialState), [initialState]);
};

export default useStore;

// @ts-ignore
export type AppDispatch = typeof store.dispatch;