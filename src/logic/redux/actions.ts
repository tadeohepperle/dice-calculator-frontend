import type { Action } from "@reduxjs/toolkit";
import type { DiceIndex } from "../data_types";

export interface AbstractAppStateAction<T> extends Action<string> {
  type: string;
  payload: T;
  error?: boolean;
  meta?: any;
}

export namespace Actions {
  export interface ChangeInputPayload {
    value: string;
    diceIndex: DiceIndex;
  }
  export interface ChangeInput
    extends AbstractAppStateAction<ChangeInputPayload> {
    type: "ChangeInput";
  }
  export function changeInput(payload: ChangeInputPayload): ChangeInput {
    return { type: "ChangeInput", payload };
  }

  export interface ChangeRollManyNumberPayload {
    value: number;
    diceIndex: DiceIndex;
  }
  export interface ChangeRollManyNumber
    extends AbstractAppStateAction<ChangeRollManyNumberPayload> {
    type: "ChangeRollManyNumber";
  }
  export function changeRollManyNumber(
    payload: ChangeRollManyNumberPayload
  ): ChangeRollManyNumber {
    return { type: "ChangeRollManyNumber", payload };
  }

  export interface CalculateDistributionPayload {
    diceIndex: DiceIndex;
  }
  export interface CalculateDistribution
    extends AbstractAppStateAction<CalculateDistributionPayload> {
    type: "CalculateDistribution";
  }
  export function calculateDistribution(
    payload: CalculateDistributionPayload
  ): CalculateDistribution {
    return { type: "CalculateDistribution", payload };
  }

  export interface RollPayload {
    diceIndex: DiceIndex;
    mode: { type: "one" } | { type: "many"; amount: number };
  }
  export interface Roll extends AbstractAppStateAction<RollPayload> {
    type: "Roll";
  }
  export function roll(payload: RollPayload): Roll {
    return { type: "Roll", payload };
  }

  export interface DeleteDicePayload {
    diceIndex: DiceIndex;
  }
  export interface DeleteDice
    extends AbstractAppStateAction<{
      diceIndex: DiceIndex;
    }> {
    type: "DeleteDice";
  }
  export function deleteDice(payload: DeleteDicePayload): DeleteDice {
    return { type: "DeleteDice", payload };
  }

  export interface AddDicePayload {}
  export interface AddDice extends AbstractAppStateAction<{}> {
    type: "AddDice";
  }
  export function addDice(payload: AddDicePayload): AddDice {
    return { type: "AddDice", payload: {} };
  }

  export type AppStateAction =
    | ChangeInput
    | DeleteDice
    | AddDice
    | CalculateDistribution
    | Roll
    | ChangeRollManyNumber;
}
