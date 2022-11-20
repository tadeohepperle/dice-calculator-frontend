import { configureStore, Reducer, Action } from "@reduxjs/toolkit";
import { hello } from "../../functions";
// import { calculateDistributionWithRust } from "../../functions";

export type DiceIndex = 0 | 1 | 2;

export interface DiceInputSegmentState {
  diceIndex: DiceIndex;
  inputValue: string;
  rolledNumber?: number;
  rolledNumbers?: number[];
}

export interface AppState {
  inputSegments: DiceInputSegmentState[];
}

const initialState: AppState = {
  inputSegments: [
    {
      diceIndex: 0,
      inputValue: "2d20",
    },
  ],
};

export interface AbstractAppStateAction<T> extends Action<string> {
  type: string;
  payload: T;
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

  export interface CalculateDistributionPayload {
    diceIndex: DiceIndex;
  }
  export interface CalculateDistribution
    extends AbstractAppStateAction<CalculateDistributionPayload> {
    type: "CalculateDistribution";
  }
  export function calculateDistribution(
    payload: CalculateDistributionPayload
  ): CalculateDistribution {
    return { type: "CalculateDistribution", payload };
  }

  export interface RollPayload {
    diceIndex: DiceIndex;
    mode: { type: "one" } | { type: "many"; amount: number };
  }
  export interface Roll extends AbstractAppStateAction<RollPayload> {
    type: "Roll";
  }
  export function roll(payload: RollPayload): Roll {
    return { type: "Roll", payload };
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
    return { type: "AddDice", payload: {} };
  }

  export type AppStateAction =
    | ChangeInput
    | DeleteDice
    | AddDice
    | CalculateDistribution
    | Roll;
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
      hello();
      let { payload } = action as Actions.ChangeInput;
      console.log(payload);
      let seg: DiceInputSegmentState = {
        ...state.inputSegments[payload.diceIndex],
        inputValue: payload.value,
      };
      let segs = state.inputSegments.map((e, i) =>
        i == payload.diceIndex ? seg : e
      );
      return { ...state, inputSegments: segs };
    } else if (action.type == "DeleteDice") {
      let { payload } = action as Actions.DeleteDice;
      let segs: DiceInputSegmentState[] = state.inputSegments
        .filter((e) => e.diceIndex != payload.diceIndex)
        .map((e) =>
          e.diceIndex <= payload.diceIndex
            ? e
            : { ...e, diceIndex: (e.diceIndex - 1) as DiceIndex }
        );

      return { ...state, inputSegments: segs };
    } else if (action.type == "AddDice") {
      if (state.inputSegments.length < 3) {
        let newSeg: DiceInputSegmentState = {
          diceIndex: state.inputSegments.length as DiceIndex,
          inputValue: "",
        };
        return { ...state, inputSegments: [...state.inputSegments, newSeg] };
      }
    } else if (action.type == "CalculateDistribution") {
      let { payload } = action as Actions.CalculateDistribution;
      let diceString = state.inputSegments[payload.diceIndex].inputValue;
      if (diceString !== "") {
        // let dist = calculateDistributionWithRust(
        //   state.inputSegments[payload.diceIndex].inputValue
        // );
      } else {
        // remove distribution; TODO
      }

      return { ...state };
    } else if (action.type == "Roll") {
      return { ...state };
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
