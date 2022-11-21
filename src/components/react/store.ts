import { configureStore, Reducer, Action } from "@reduxjs/toolkit";
import { mscounter } from "../../functions_depr";
import { workerExperiment } from "../../webworker_functions";
// import { wasmComputeDice } from "../../webworker_functions";

// import { calculateDistributionWithRust } from "../../functions";

workerExperiment();

export type DiceIndex = 0 | 1 | 2;

export type CalculationState = "newinput" | "calculating" | "done" | "error";

export interface DiceInputSegmentState {
  diceIndex: DiceIndex;
  inputValue: string;
  rollResults?:
    | { type: "one"; number: number }
    | { type: "many"; numbers: number[] };
  rolledNumber?: number;
  rolledNumbers?: number[];
  calculationState: CalculationState;
  rollManyNumber: number; // how many dice to roll when "roll many" button is clicked.
}

export interface AppState {
  inputSegments: DiceInputSegmentState[];
}

const initialState: AppState = {
  inputSegments: [
    {
      diceIndex: 0,
      inputValue: "2d20",
      calculationState: "newinput",
      rollManyNumber: 100,
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

  export interface ChangeRollManyNumberPayload {
    value: number;
    diceIndex: DiceIndex;
  }
  export interface ChangeRollManyNumber
    extends AbstractAppStateAction<ChangeRollManyNumberPayload> {
    type: "ChangeRollManyNumber";
  }
  export function changeRollManyNumber(
    payload: ChangeRollManyNumberPayload
  ): ChangeRollManyNumber {
    return { type: "ChangeRollManyNumber", payload };
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
    | Roll
    | ChangeRollManyNumber;
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
      let { payload } = action as Actions.ChangeInput;

      let seg: DiceInputSegmentState = {
        ...state.inputSegments[payload.diceIndex],
        inputValue: payload.value,
        calculationState: "newinput",
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
          calculationState: "newinput",
          rollManyNumber: 100,
        };
        return { ...state, inputSegments: [...state.inputSegments, newSeg] };
      }
    } else if (action.type == "CalculateDistribution") {
      let { payload } = action as Actions.CalculateDistribution;

      let diceString = state.inputSegments[payload.diceIndex].inputValue;
      const doCalculations = async (
        diceIndex: DiceIndex,
        diceString: string
      ) => {
        if (diceString !== "") {
          // let d = await wasmComputeDice(diceString);
          console.log("fuck you TODO");
        } else {
          // remove distribution; TODO
        }
      };
      doCalculations(payload.diceIndex, diceString);
      // TODO!!! move to webworker thread.
      mscounter();
      let seg: DiceInputSegmentState = {
        ...state.inputSegments[payload.diceIndex],
        calculationState: "calculating",
      };
      let segs = state.inputSegments.map((e, i) =>
        i == payload.diceIndex ? seg : e
      );
      return { ...state, inputSegments: segs };
    } else if (action.type == "Roll") {
      return { ...state };
    } else if (action.type == "ChangeRollManyNumber") {
      let { payload } = action as Actions.ChangeRollManyNumber;
      let seg: DiceInputSegmentState = {
        ...state.inputSegments[payload.diceIndex],
        rollManyNumber: payload.value,
      };
      let segs = state.inputSegments.map((e, i) =>
        i == payload.diceIndex ? seg : e
      );
      return { ...state, inputSegments: segs };
    } else {
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
