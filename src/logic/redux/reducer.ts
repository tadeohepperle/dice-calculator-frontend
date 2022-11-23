import { configureStore, Reducer, Action } from "@reduxjs/toolkit";
import { wasmComputeDice } from "../webworker/webworker_interface";
import type { DiceIndex } from "../data_types";
import type { Actions } from "./actions";
import { AppState, DiceInputSegmentState, initialState } from "./state";

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
      const doCalculationsAndUpdateState = async (
        diceIndex: DiceIndex,
        diceString: string
      ) => {
        if (diceString !== "") {
          try {
            let d = await wasmComputeDice(diceString);
            console.log(`d.build_time: ${d}`);
          } catch (ex) {
            console.log(ex);
          }
        } else {
          // remove distribution; TODO
        }
      };
      doCalculationsAndUpdateState(payload.diceIndex, diceString);

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
