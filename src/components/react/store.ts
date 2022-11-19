import { configureStore, Reducer, Action } from "@reduxjs/toolkit";

export type DiceIndex = 0 | 1 | 2;

export interface DiceInputSegmentState {
  diceIndex: DiceIndex;
  inputField: string;
}

export interface AppState {
  counter: number;
}

const initialState: AppState = {
  counter: 0,
};

export interface AbstractAppStateAction<T> extends Action<string> {
  type: string;
  payload?: T;
  error?: boolean;
  meta?: any;
}

export namespace Actions {
  export interface ChangeInputPayload {
    value: string;
    diceIndex: DiceIndex;
  }
  export interface ChangeInput
    extends AbstractAppStateAction<ChangeInputPayload> {
    type: "ChangeInput";
  }
  export function changeInput(payload: ChangeInputPayload): ChangeInput {
    return { type: "ChangeInput", payload };
  }

  export interface DeleteDicePayload {
    diceIndex: DiceIndex;
  }
  export interface DeleteDice
    extends AbstractAppStateAction<{
      diceIndex: DiceIndex;
    }> {
    type: "DeleteDice";
  }
  export function deleteDice(payload: DeleteDicePayload): DeleteDice {
    return { type: "DeleteDice", payload };
  }

  export interface AddDicePayload {}
  export interface AddDice extends AbstractAppStateAction<{}> {
    type: "AddDice";
  }
  export function addDice(payload: AddDicePayload): AddDice {
    return { type: "AddDice" };
  }

  export type AppStateAction = ChangeInput | DeleteDice | AddDice;
}

const rootReducer: Reducer<AppState, Actions.AppStateAction> = (
  state: AppState | undefined,
  action: Actions.AppStateAction
) => {
  if (!state) {
    return initialState;
  }
  try {
    if (action.type == "ChangeInput") {
      let a = action as Actions.ChangeInput;
      return { ...state };
    } else if (action.type == "DeleteDice") {
      let a = action as Actions.DeleteDice;
      return { ...state };
    } else if (action.type == "AddDice") {
      console.log("dispatched adddice");
      let a = action as Actions.AddDice;
      return { ...state, counter: state.counter + 1 };
    } else {
      // ERROR : `Circle` is not assignable to `never`
      const _exhaustiveCheck: never = action;
    }
  } catch (err) {
    console.error(err);
  }

  return state;
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// (state: AppState, action: AppStateAction) => AppState
