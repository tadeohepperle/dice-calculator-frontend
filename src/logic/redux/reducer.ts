import { configureStore, Reducer, Action } from "@reduxjs/toolkit";
import { wasmComputeDice } from "../webworker/webworker_interface";
import type { DiceIndex, JsDiceMaterialized } from "../data_types";
import { Actions } from "./actions";
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
  AddErrorMessage: (s, a) =>
    addErrorMessageReducer(s, a.payload as Actions.AddErrorMessagePayload),
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
  //   preloadedState: initialState,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

////////////////////////////////////////////////////////////////////////////////
// INDIVIDUAL REDUCER FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

function changeInputReducer(
  state: AppState,
  payload: Actions.ChangeInputPayload
): AppState {
  const { diceIndex } = payload;
  let seg: DiceInputSegmentState = {
    ...state.inputSegments[payload.diceIndex]!,
    inputValue: payload.value,
    calculationState: "newinput",
  };
  let dice;
  let segs = { ...state.inputSegments, [diceIndex]: seg };
  return { ...state, inputSegments: segs };
}

function deleteDiceReducer(
  state: AppState,
  payload: Actions.DeleteDicePayload
): AppState {
  const { diceIndex } = payload;
  let segs = { ...state.inputSegments, [diceIndex]: undefined };
  return { ...state, inputSegments: segs };
}

function addDiceReducer(
  state: AppState,
  payload: Actions.AddDicePayload
): AppState {
  let numSegs: DiceIndex = (1 +
    (state.inputSegments[1] ? 1 : 0) +
    (state.inputSegments[2] ? 1 : 0)) as DiceIndex;

  if (numSegs < 3) {
    let seg: DiceInputSegmentState = {
      diceIndex: numSegs,
      inputValue: "",
      calculationState: "newinput",
      rollManyNumber: 100,
    };
    return updateSegInState(state, numSegs, seg);
  } else {
    return state;
  }
}

function changeRollManyNumberReducer(
  state: AppState,
  payload: Actions.ChangeRollManyNumberPayload
): AppState {
  const { diceIndex, value } = payload;
  let seg: DiceInputSegmentState = {
    ...state.inputSegments[diceIndex]!,
    rollManyNumber: value,
  };
  return updateSegInState(state, diceIndex, seg);
}

function calculateDistributionReducer(
  state: AppState,
  payload: Actions.CalculateDistributionPayload
): AppState {
  let input = state.inputSegments[payload.diceIndex]!.inputValue;

  const doCalculationsAndUpdateState = async (
    diceIndex: DiceIndex,
    input: string
  ) => {
    if (!input) {
      store.dispatch(Actions.addErrorMessage(diceIndex, "Input is empty!"));
    }
    try {
      let dice: JsDiceMaterialized = await wasmComputeDice(
        diceIndex,
        input,
        state.percentile_query,
        state.probability_query
      );

      // TODO
    } catch (ex) {
      console.error(ex);
      store.dispatch(
        Actions.addErrorMessage(diceIndex, "Computation resulted in error")
      );
    }
  };
  doCalculationsAndUpdateState(payload.diceIndex, input);

  let seg: DiceInputSegmentState = {
    ...state.inputSegments[payload.diceIndex]!,
    calculationState: "calculating",
  };
  return updateSegInState(state, payload.diceIndex, seg);
}

function rollReducer(state: AppState, payload: Actions.RollPayload): AppState {
  return state;
}

function addErrorMessageReducer(
  state: AppState,
  payload: Actions.AddErrorMessagePayload
): AppState {
  const { diceIndex, message } = payload;
  let seg: DiceInputSegmentState = {
    ...state.inputSegments[diceIndex]!,
    calculationState: { type: "error", message },
  };
  return updateSegInState(state, diceIndex, seg);
}

////////////////////////////////////////////////////////////////////////////////
// functions
////////////////////////////////////////////////////////////////////////////////

function updateSegInState(
  state: AppState,
  diceIndex: DiceIndex,
  seg: DiceInputSegmentState
): AppState {
  return {
    ...state,
    inputSegments: { ...state.inputSegments, [diceIndex]: seg },
  };
}
