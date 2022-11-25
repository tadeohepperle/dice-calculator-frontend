import type { DiceIndex, JsDiceMaterialized, RollResult } from "../data_types";

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
  inputSegments: {
    0: DiceInputSegmentState;
    1?: DiceInputSegmentState;
    2?: DiceInputSegmentState;
  };
  computedDices: Record<DiceIndex, JsDiceMaterialized | undefined>;
  probabilityQuery: number;
  probabilityQueryMode: ProbabilityQueryMode;
  percentileQuery: number;
}

export const initialState: AppState = {
  inputSegments: {
    0: {
      diceIndex: 0,
      inputValue: "2d20",
      calculationState: { type: "newinput" },
      rollManyNumber: 100,
    },
  },
  computedDices: { 0: undefined, 1: undefined, 2: undefined },
  percentileQuery: 90,
  probabilityQuery: 6,
  probabilityQueryMode: "lte",
};
