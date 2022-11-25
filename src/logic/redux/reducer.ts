import {
  configureStore,
  Reducer,
  Action,
  createAsyncThunk,
  MiddlewareAPI,
  Middleware,
} from "@reduxjs/toolkit";
import {
  wasmComputeDice,
  wasmComputePercentiles,
  wasmComputeProbabilities,
} from "../webworker/webworker_interface";
import { ALL_DICE_INDICES, DiceIndex, JsDiceMaterialized } from "../data_types";
import { Actions } from "./actions";
import {
  AppState,
  CalculationState,
  DiceInputSegmentState,
  initialState,
} from "./state";
import type { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import { SafeDispatchInRecuderMiddleware } from "./middleware";
import { wait } from "../utils";

let ___: Actions.AppStateAction;
const actionTypeFunctionMap: Record<
  typeof ___.type,
  (state: AppState, action: Actions.AppStateAction) => AppState
> = {
  RawReduction: (s, a) => (a as Actions.RawReduction).payload(s),
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
  ChangeProbabilityQuery: (s, a) =>
    changeProbabilityQueryReducer(
      s,
      a.payload as Actions.ChangeProbabilityQueryPayload
    ),
  ChangePercentileQuery: (s, a) =>
    changePercentileQueryReducer(
      s,
      a.payload as Actions.ChangePercentileQueryPayload
    ),
};

const rootReducer: Reducer<AppState, Actions.AppStateAction> = (
  state: AppState | undefined,
  action: Actions.AppStateAction
): AppState => {
  return !state
    ? initialState
    : actionTypeFunctionMap[action.type](state, action);
};

const safeDispatchMiddleware: SafeDispatchInRecuderMiddleware =
  new SafeDispatchInRecuderMiddleware();
const _store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(safeDispatchMiddleware.createMiddlewareFunction()),
});

safeDispatchMiddleware.store = _store;

export const store = _store;
export type RootState = ReturnType<typeof rootReducer>;
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
    calculationState: { type: "newinput" },
  };
  return updateSegInState(state, diceIndex, seg);
}

function deleteDiceReducer(
  state: AppState,
  payload: Actions.DeleteDicePayload
): AppState {
  const { diceIndex } = payload;
  let segs = { ...state.inputSegments, [diceIndex]: undefined };
  let dices = { ...state.computedDices, [diceIndex]: undefined };
  return {
    ...state,
    inputSegments: segs,
    computedDices: dices,
    segmentDisplayOrder: state.segmentDisplayOrder.filter(
      (e) => e !== diceIndex
    ),
  };
}

function addDiceReducer(
  state: AppState,
  payload: Actions.AddDicePayload
): AppState {
  let segs0or1: number[] = ALL_DICE_INDICES.map((i) =>
    state.inputSegments[i] ? 1 : 0
  );
  let count = segs0or1.reduce((a, c) => a + c, 0);

  if (count < 3) {
    // find first one to update:
    let firstFreeIndex = segs0or1.findIndex((e) => e == 0) as DiceIndex;

    let seg: DiceInputSegmentState = {
      diceIndex: firstFreeIndex,
      inputValue: "",
      calculationState: { type: "error", message: "" },
      rollManyNumber: 100,
    };
    let newState = updateSegInState(state, firstFreeIndex, seg);
    let newOrder = [...newState.segmentDisplayOrder, firstFreeIndex];
    return { ...newState, segmentDisplayOrder: newOrder };
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
  (async (diceIndex: DiceIndex, input: string) => {
    if (!input) {
      return safeDispatchMiddleware.dispatch(
        Actions.addErrorMessage(diceIndex, "Input is empty!")
      );
    }
    try {
      let percentileQueryNum = parseInt(state.percentileQuery);
      let probabilityQueryNum = parseInt(state.probabilityQuery);
      let dice: JsDiceMaterialized = await wasmComputeDice(
        diceIndex,
        input,
        isNaN(percentileQueryNum) ? undefined : percentileQueryNum,
        isNaN(probabilityQueryNum) ? undefined : probabilityQueryNum
      );
      const reduction = (s: RootState): RootState => {
        let newState = updateCalculationStateInState(state, diceIndex, {
          type: "done",
        });
        return updateComputedDiceInState(newState, diceIndex, dice);
      };
      safeDispatchMiddleware.dispatch(Actions.rawReduction(reduction));
    } catch (ex) {
      return safeDispatchMiddleware.dispatch(
        Actions.addErrorMessage(diceIndex, "Computation resulted in error")
      );
    }
  })(payload.diceIndex, input);

  let seg: DiceInputSegmentState = {
    ...state.inputSegments[payload.diceIndex]!,
    calculationState: { type: "calculating" },
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

function changeProbabilityQueryReducer(
  state: AppState,
  query: Actions.ChangeProbabilityQueryPayload
): AppState {
  let queryNum: number = parseInt(query);
  if (isNaN(queryNum)) {
    return { ...state, probabilityQuery: query };
  }
  (async (parsed: number) => {
    try {
      let result = await wasmComputeProbabilities(parsed);
      const reduction = (state: AppState): AppState => {
        return applyProbabilityQueriesToDicesInState(
          state,
          result.map((e) => e.probability),
          parsed
        );
      };
      safeDispatchMiddleware.dispatch(Actions.rawReduction(reduction));
    } catch (ex) {
      console.error(ex);
      // TODO: idk maybe an error state for percentiles and probabilities???
    }
  })(queryNum);
  return applyProbabilityQueriesToDicesInState(
    state,
    [undefined, undefined, undefined],
    queryNum
  );
}

function changePercentileQueryReducer(
  state: AppState,
  query: Actions.ChangePercentileQueryPayload
): AppState {
  let queryNum: number = parseFloat(query);
  if (isNaN(queryNum)) {
    return { ...state, percentileQuery: query };
  }
  (async (parsed: number) => {
    try {
      let result = await wasmComputePercentiles(parsed);
      const reduction = (state: AppState): AppState => {
        return applyPercentileQueriesToDicesInState(
          state,
          result.map((e) => e.percentile),
          parsed
        );
      };
      safeDispatchMiddleware.dispatch(Actions.rawReduction(reduction));
    } catch (ex) {
      console.error(ex);
      // TODO: idk maybe an error state for percentiles and probabilities???
    }
  })(queryNum);
  return applyPercentileQueriesToDicesInState(
    state,
    [undefined, undefined, undefined],
    queryNum
  );
}

////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

function updateCalculationStateInState(
  state: AppState,
  diceIndex: DiceIndex,
  calculationState: CalculationState
): AppState {
  let seg: DiceInputSegmentState = {
    ...state.inputSegments[diceIndex]!,
    calculationState: calculationState,
  };
  return updateSegInState(state, diceIndex, seg);
}

function updateComputedDiceInState(
  state: AppState,
  diceIndex: DiceIndex,
  dice: JsDiceMaterialized
): AppState {
  return {
    ...state,
    computedDices: { ...state.computedDices, [diceIndex]: dice },
  };
}

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

function applyProbabilityQueriesToDicesInState(
  state: AppState,
  results: JsDiceMaterialized["probabilityQuery"]["result"][],
  query: number
): AppState {
  let newComputedDicesArr: (JsDiceMaterialized | undefined)[] =
    ALL_DICE_INDICES.map((i) => {
      return state.computedDices[i] === undefined
        ? undefined
        : {
            ...state.computedDices[i]!,
            probabilityQuery: { result: results[i], query: query },
          };
    });
  let newComputedDices = {
    0: newComputedDicesArr[0],
    1: newComputedDicesArr[1],
    2: newComputedDicesArr[2],
  };
  return {
    ...state,
    computedDices: newComputedDices,
    probabilityQuery: query.toString(),
  };
}

function applyPercentileQueriesToDicesInState(
  state: AppState,
  results: JsDiceMaterialized["percentileQuery"]["result"][],
  query: number
): AppState {
  let newComputedDicesArr: (JsDiceMaterialized | undefined)[] =
    ALL_DICE_INDICES.map((i) => {
      return state.computedDices[i] === undefined
        ? undefined
        : {
            ...state.computedDices[i]!,
            percentileQuery: { result: results[i], query: query },
          };
    });
  let newComputedDices = {
    0: newComputedDicesArr[0],
    1: newComputedDicesArr[1],
    2: newComputedDicesArr[2],
  };
  return {
    ...state,
    computedDices: newComputedDices,
    percentileQuery: query.toString(),
  };
}
