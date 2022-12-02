import type { InitSettings } from "./../data_types";
import {
  ALL_DICE_INDICES,
  DiceIndex,
  JsDiceMaterialized,
  PdfAndCdfDistributionChartData,
  RollResult,
} from "../data_types";
import type { RootState } from "./reducer";

export type CalculationState =
  | { type: "newinput" }
  | { type: "calculating" }
  | { type: "done" }
  | { type: "error"; message: string };

export interface DiceInputSegmentState {
  diceIndex: DiceIndex;
  initialInput: string;
  rollResult?: RollResult;
  rolledNumber?: number;
  rolledNumbers?: number[];
  calculationState: CalculationState;
  rollManyNumber: number; // how many dice to roll when "roll many" button is clicked.
}

export type ProbabilityQueryMode = "lt" | "lte" | "eq" | "gte" | "gt";

export interface AppState {
  segmentDisplayOrder: DiceIndex[];
  inputSegments: {
    0?: DiceInputSegmentState;
    1?: DiceInputSegmentState;
    2?: DiceInputSegmentState;
  };
  computedDices: Record<DiceIndex, JsDiceMaterialized | undefined>;
  probabilityQuery: string;
  probabilityQueryMode: ProbabilityQueryMode;
  percentileQuery: string;
  chartData: PdfAndCdfDistributionChartData | undefined;
}

export const INITIAL_DICE_0_INPUT = "2d20";

export function initSettingsToInitialState(
  initSettings: InitSettings | undefined
): AppState {
  let segmentDisplayOrder: DiceIndex[] = [];
  ALL_DICE_INDICES.forEach((i) => {
    if (initSettings?.[i]) segmentDisplayOrder.push(i);
  });
  let needToInsertDefaultDiceAs0 = false;
  if (segmentDisplayOrder.length == 0) {
    segmentDisplayOrder = [0];
    needToInsertDefaultDiceAs0 = true;
  }

  return {
    segmentDisplayOrder,
    inputSegments: {
      0:
        initSettings?.[0] || needToInsertDefaultDiceAs0
          ? {
              diceIndex: 0,
              initialInput: initSettings?.[0] || INITIAL_DICE_0_INPUT,
              calculationState: { type: "newinput" },
              rollManyNumber: 100,
            }
          : undefined,
      1: initSettings?.[1]
        ? {
            diceIndex: 1,
            initialInput: initSettings?.[1],
            calculationState: { type: "newinput" },
            rollManyNumber: 100,
          }
        : undefined,
      2: initSettings?.[2]
        ? {
            diceIndex: 2,
            initialInput: initSettings?.[2],
            calculationState: { type: "newinput" },
            rollManyNumber: 100,
          }
        : undefined,
    },
    // todo rename to init and inject into components
    computedDices: { 0: undefined, 1: undefined, 2: undefined },
    percentileQuery: initSettings?.perc?.toString() || "90",
    probabilityQuery: initSettings?.prob?.toString() || "6",
    probabilityQueryMode: initSettings?.cmpMode || "eq",
    chartData: undefined,
  };
}
////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

export const numberOfInputSegments = (state: AppState): number =>
  ALL_DICE_INDICES.map((i) =>
    state.inputSegments[i] !== undefined ? (1 as number) : 0
  ).reduce((a, c) => a + c, 0);

// export const getDistributions = (state: AppState): Distributions => {
//   return {
//     0: state.computedDices[0] && {
//       pdf: state.computedDices[0].distribution,
//       cdf: state.computedDices[0].cumulative_distribution,
//     },
//     1: state.computedDices[1] && {
//       pdf: state.computedDices[1].distribution,
//       cdf: state.computedDices[1].cumulative_distribution,
//     },
//     2: state.computedDices[2] && {
//       pdf: state.computedDices[2].distribution,
//       cdf: state.computedDices[2].cumulative_distribution,
//     },
//   };
// };
