import type { DiceIndex } from "../data_types";

export type CalculationState =
  | "newinput"
  | "calculating"
  | "done"
  | { type: "error"; message: string };

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

export const initialState: AppState = {
  inputSegments: [
    {
      diceIndex: 0,
      inputValue: "2d20",
      calculationState: "newinput",
      rollManyNumber: 100,
    },
  ],
};
