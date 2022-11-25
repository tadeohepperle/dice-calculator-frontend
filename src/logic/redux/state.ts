import {
  ALL_DICE_INDICES,
  DiceIndex,
  JsDiceMaterialized,
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
  inputValue: string;
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
}

export const initialState: AppState = {
  segmentDisplayOrder: [0],
  inputSegments: {
    0: {
      diceIndex: 0,
      inputValue: "2d20",
      calculationState: { type: "newinput" },
      rollManyNumber: 100,
    },
  },
  computedDices: { 0: undefined, 1: undefined, 2: undefined },
  percentileQuery: "90",
  probabilityQuery: "6",
  probabilityQueryMode: "lte",
};

////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

export const numberOfInputSegments = (state: AppState): number =>
  ALL_DICE_INDICES.map((i) =>
    state.inputSegments[i] !== undefined ? (1 as number) : 0
  ).reduce((a, c) => a + c, 0);
