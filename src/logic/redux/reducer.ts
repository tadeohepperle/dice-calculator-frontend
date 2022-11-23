import { configureStore, Reducer, Action } from "@reduxjs/toolkit";
import { wasmComputeDice } from "../webworker/webworker_interface";
import type { DiceIndex } from "../data_types";
import type { Actions } from "./actions";
import { AppState, DiceInputSegmentState, initialState } from "./state";

let ___: Actions.AppStateAction;
const actionTypeFunctionMap: Record<
  typeof ___.type,
  (state: AppState, action: Actions.AppStateAction) => AppState
> = {
  ChangeInput: (s, a) =>
    changeInputReducer(s, a.payload as Actions.ChangeInputPayload),
  DeleteDice: (s, a) =>
    deleteDiceReducer(s, a.payload as Actions.DeleteDicePayload),
  AddDice: (s, a) => addDiceReducer(s, a.payload as Actions.AddDicePayload),
  ChangeRollManyNumber: (s, a) =>
    changeRollManyNumberReducer(
      s,
      a.payload as Actions.ChangeRollManyNumberPayload
    ),
  CalculateDistribution: (s, a) =>
    calculateDistributionReducer(
      s,
      a.payload as Actions.CalculateDistributionPayload
    ),
  Roll: (s, a) => rollReducer(s, a.payload as Actions.RollPayload),
};

const rootReducer: Reducer<AppState, Actions.AppStateAction> = (
  state: AppState | undefined,
  action: Actions.AppStateAction
): AppState => {
  return !state
    ? initialState
    : actionTypeFunctionMap[action.type](state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialState,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

function changeInputReducer(
  state: AppState,
  payload: Actions.ChangeInputPayload
): AppState {
  let seg: DiceInputSegmentState = {
    ...state.inputSegments[payload.diceIndex],
    inputValue: payload.value,
    calculationState: "newinput",
  };
  let segs = state.inputSegments.map((e, i) =>
    i == payload.diceIndex ? seg : e
  );
  return { ...state, inputSegments: segs };
}

function deleteDiceReducer(
  state: AppState,
  payload: Actions.DeleteDicePayload
): AppState {
  let segs: DiceInputSegmentState[] = state.inputSegments
    .filter((e) => e.diceIndex != payload.diceIndex)
    .map((e) =>
      e.diceIndex <= payload.diceIndex
        ? e
        : { ...e, diceIndex: (e.diceIndex - 1) as DiceIndex }
    );

  return { ...state, inputSegments: segs };
}

function addDiceReducer(
  state: AppState,
  payload: Actions.AddDicePayload
): AppState {
  if (state.inputSegments.length < 3) {
    let newSeg: DiceInputSegmentState = {
      diceIndex: state.inputSegments.length as DiceIndex,
      inputValue: "",
      calculationState: "newinput",
      rollManyNumber: 100,
    };
    return { ...state, inputSegments: [...state.inputSegments, newSeg] };
  } else {
    return state;
  }
}

function changeRollManyNumberReducer(
  state: AppState,
  payload: Actions.ChangeRollManyNumberPayload
): AppState {
  let seg: DiceInputSegmentState = {
    ...state.inputSegments[payload.diceIndex],
    rollManyNumber: payload.value,
  };
  let segs = state.inputSegments.map((e, i) =>
    i == payload.diceIndex ? seg : e
  );
  return { ...state, inputSegments: segs };
}

function calculateDistributionReducer(
  state: AppState,
  payload: Actions.CalculateDistributionPayload
): AppState {
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
}

function rollReducer(state: AppState, payload: Actions.RollPayload): AppState {
  return state;
}
