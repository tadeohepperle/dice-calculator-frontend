import type { DiceIndex, RollResult } from "../data_types";

export type CalculationState =
  | "newinput"
  | "calculating"
  | "done"
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
  inputSegments: {
    0: DiceInputSegmentState;
    1?: DiceInputSegmentState;
    2?: DiceInputSegmentState;
  };
  probability_query: number;
  probability_query_mode: ProbabilityQueryMode;
  percentile_query: number;
}

export const initialState: AppState = {
  inputSegments: {
    0: {
      diceIndex: 0,
      inputValue: "2d20",
      calculationState: "newinput",
      rollManyNumber: 100,
    },
  },
  percentile_query: 90,
  probability_query: 6,
  probability_query_mode: "lte",
};
