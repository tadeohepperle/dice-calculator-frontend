import type { InitSettings } from "./../data_types";
import { configureStore, Reducer } from "@reduxjs/toolkit";
import {
  wasmComputeDice,
  wasmComputePercentiles,
  wasmComputeProbabilities,
  wasmRemoveDice,
  wasmResetAllDice,
  wasmRoll,
} from "../webworker/webworker_interface";
import { ALL_DICE_INDICES, DiceIndex, JsDiceMaterialized } from "../data_types";
import { Actions } from "./actions";
import {
  AppState,
  CalculationState,
  DiceInputSegmentState,
  INITIAL_DICE_0_INPUT,
  initSettingsToInitialState,
} from "./state";
import type { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import { SafeDispatchInRecuderMiddleware } from "./middleware";

let ___: Actions.AppStateAction;
const actionTypeFunctionMap: Record<
  typeof ___.type,
  (state: AppState, action: Actions.AppStateAction) => AppState
> = {
  RawReduction: (s, a) => (a as Actions.RawReduction).payload(s),

  DeleteDice: (s, a) =>
    deleteDiceReducer(s, a.payload as Actions.DeleteDicePayload),
  AddDice: (s, a) => addDiceReducer(s, a.payload as Actions.AddDicePayload),

  CalculateDistribution: (s, a) =>
    calculateDistributionReducer(
      s,
      a.payload as Actions.CalculateDistributionPayload
    ),
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
  Reset: (s, a) => resetReducer(s, a.payload as Actions.ResetPayload),
};

let cachedInitSettings: InitSettings | undefined = undefined;
const rootReducer: Reducer<AppState, Actions.AppStateAction> = (
  state: AppState | undefined,
  action: Actions.AppStateAction
): AppState => {
  return !state
    ? initSettingsToInitialState(cachedInitSettings)
    : actionTypeFunctionMap[action.type](state, action);
};

export const safeDispatchMiddleware: SafeDispatchInRecuderMiddleware =
  new SafeDispatchInRecuderMiddleware();
let _store: ToolkitStore;

export function configureStoreWithInitSettings(
  partialInitSettings: Partial<InitSettings>
) {
  cachedInitSettings = defaultInitSettings(partialInitSettings);
  _store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(safeDispatchMiddleware.createMiddlewareFunction()),
  });
  safeDispatchMiddleware.store = _store;
  kickoffInitialDistributionCalculation(cachedInitSettings!);
  return _store;
}

export type RootState = ReturnType<typeof rootReducer>;

////////////////////////////////////////////////////////////////////////////////
// INDIVIDUAL REDUCER FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

function deleteDiceReducer(
  state: AppState,
  payload: Actions.DeleteDicePayload
): AppState {
  const { diceIndex } = payload;
  let segs = { ...state.inputSegments, [diceIndex]: undefined };
  let dices = { ...state.computedDices, [diceIndex]: undefined };

  if (state.computedDices[diceIndex] !== undefined) {
    (async (diceIndex) => {
      let chartData = await wasmRemoveDice(diceIndex);
      if (chartData !== "unchanged") {
        let c = chartData;
        let reduction = (state: AppState): AppState => ({
          ...state,
          chartData: c,
        });
        safeDispatchMiddleware.dispatch(Actions.rawReduction(reduction));
      }
    })(diceIndex);
  }
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
      initialInput: "",
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

function calculateDistributionReducer(
  state: AppState,
  payload: Actions.CalculateDistributionPayload
): AppState {
  let { diceIndex, inputValue: input } = payload;
  (async (diceIndex: DiceIndex, input: string) => {
    if (!input) {
      return safeDispatchMiddleware.dispatch(
        Actions.addErrorMessage(diceIndex, "Input is empty!")
      );
    }
    try {
      let percentileQueryNum = parseInt(state.percentileQuery);
      let probabilityQueryNum = parseInt(state.probabilityQuery);
      let [dice, chartData] = await wasmComputeDice(
        diceIndex,
        input,
        isNaN(percentileQueryNum) ? undefined : percentileQueryNum,
        isNaN(probabilityQueryNum) ? undefined : probabilityQueryNum
      );
      console.log("chartdata computed:", dice, chartData);
      const reduction = (state: RootState): RootState => {
        let newState = updateCalculationStateInState(state, diceIndex, {
          type: "done",
        });

        if (chartData !== "unchanged") {
          newState = { ...newState, chartData };
        }
        return updateComputedDiceInState(newState, diceIndex, dice);
      };
      safeDispatchMiddleware.dispatch(Actions.rawReduction(reduction));
    } catch (ex) {
      return safeDispatchMiddleware.dispatch(
        Actions.addErrorMessage(diceIndex, "Computation resulted in error")
      );
    }
  })(diceIndex, input);

  return updateCalculationStateInState(state, diceIndex, {
    type: "calculating",
  });
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

function resetReducer(
  _: AppState,
  partialSettings: Actions.ResetPayload
): AppState {
  console.log("reset", partialSettings);
  let settings = defaultInitSettings(partialSettings);
  kickoffInitialDistributionCalculation(settings!);
  return initSettingsToInitialState(settings);
}

////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

async function kickoffInitialDistributionCalculation(
  initSettings: InitSettings
) {
  // perform initial wasm calculations on page load or reset
  try {
    let results = await wasmResetAllDice(
      { [0]: initSettings[0], [1]: initSettings[1], [2]: initSettings[2] },
      isNaN(initSettings.perc) ? undefined : initSettings.perc,
      isNaN(initSettings.prob) ? undefined : initSettings.prob
    );

    const reduction = (state: RootState): RootState => {
      let newState: AppState = {
        ...state,
        chartData:
          results.chartData !== "unchanged" ? results.chartData : undefined,
        computedDices: {
          0: results.dices[0],
          1: results.dices[1],
          2: results.dices[2],
        },
        inputSegments: {
          0:
            state.inputSegments[0] !== undefined
              ? {
                  ...state.inputSegments[0],
                  calculationState: { type: "done" },
                  initialInput:
                    initSettings[0] !== undefined
                      ? initSettings[0]
                      : state.inputSegments[0].initialInput,
                }
              : undefined,
          1:
            state.inputSegments[1] !== undefined
              ? {
                  ...state.inputSegments[1],
                  calculationState: { type: "done" },
                  initialInput:
                    initSettings[1] !== undefined
                      ? initSettings[1]
                      : state.inputSegments[1].initialInput,
                }
              : undefined,
          2:
            state.inputSegments[2] !== undefined
              ? {
                  ...state.inputSegments[2],
                  calculationState: { type: "done" },
                  initialInput:
                    initSettings[2] !== undefined
                      ? initSettings[2]
                      : state.inputSegments[2].initialInput,
                }
              : undefined,
        },
      };

      return newState;
    };
    safeDispatchMiddleware.dispatch(Actions.rawReduction(reduction));
  } catch (ex) {
    ALL_DICE_INDICES.forEach((i) => {
      if (initSettings[i] !== undefined) {
        safeDispatchMiddleware.dispatch(
          Actions.addErrorMessage(i, "Computation resulted in error")
        );
      }
    });
  }

  // let numDices = ALL_DICE_INDICES.reduce(
  //   (a: number, c) => (initSettings[c] !== undefined ? a + 1 : a),
  //   0
  // );

  // console.log(numDices);
  // ALL_DICE_INDICES.forEach((i) => {
  //   if (initSettings[i] !== undefined || (numDices == 0 && i === 0)) {
  //     safeDispatchMiddleware.dispatch(
  //       Actions.calculateDistribution(
  //         i,
  //         initSettings[i] ?? INITIAL_DICE_0_INPUT
  //       )
  //     );
  //   }
  // });
}

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

function defaultInitSettings(partial: Partial<InitSettings>): InitSettings {
  let numDices = ALL_DICE_INDICES.reduce(
    (a: number, c) => (partial[c] !== undefined ? a + 1 : a),
    0
  );

  return {
    [0]: numDices == 0 ? INITIAL_DICE_0_INPUT : partial[0],
    [1]: partial[1],
    [2]: partial[2],
    cmpMode: partial.cmpMode || "lte",
    chartMode: partial.chartMode || "pdf",
    numberMode: partial.numberMode || "fraction",
    perc: partial.perc || 90,
    prob: partial.prob || 5,
  };
}
