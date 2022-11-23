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
  export function changeInput(
    diceIndex: DiceIndex,
    value: string
  ): ChangeInput {
    return { type: "ChangeInput", payload: { diceIndex, value } };
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
    diceIndex: DiceIndex,
    value: number
  ): ChangeRollManyNumber {
    return { type: "ChangeRollManyNumber", payload: { diceIndex, value } };
  }

  export interface CalculateDistributionPayload {
    diceIndex: DiceIndex;
  }
  export interface CalculateDistribution
    extends AbstractAppStateAction<CalculateDistributionPayload> {
    type: "CalculateDistribution";
  }
  export function calculateDistribution(
    diceIndex: DiceIndex
  ): CalculateDistribution {
    return { type: "CalculateDistribution", payload: { diceIndex } };
  }

  export interface RollPayload {
    diceIndex: DiceIndex;
    mode: { type: "one" } | { type: "many"; amount: number };
  }
  export interface Roll extends AbstractAppStateAction<RollPayload> {
    type: "Roll";
  }
  export function rollOne(diceIndex: DiceIndex): Roll {
    return { type: "Roll", payload: { diceIndex, mode: { type: "one" } } };
  }
  export function rollMany(diceIndex: DiceIndex, amount: number): Roll {
    return {
      type: "Roll",
      payload: { diceIndex, mode: { type: "many", amount: amount } },
    };
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
  export function deleteDice(diceIndex: DiceIndex): DeleteDice {
    return { type: "DeleteDice", payload: { diceIndex } };
  }

  export interface AddDicePayload {}
  export interface AddDice extends AbstractAppStateAction<{}> {
    type: "AddDice";
  }
  export function addDice(): AddDice {
    return { type: "AddDice", payload: {} };
  }

  export interface AddErrorMessagePayload {
    diceIndex: DiceIndex;
    message: string;
  }
  export interface AddErrorMessage extends AbstractAppStateAction<{}> {
    type: "AddErrorMessage";
  }
  export function addErrorMessage(
    diceIndex: DiceIndex,
    message: string
  ): AddErrorMessage {
    return { type: "AddErrorMessage", payload: { diceIndex, message } };
  }

  export type AppStateAction =
    | ChangeInput
    | DeleteDice
    | AddDice
    | CalculateDistribution
    | Roll
    | ChangeRollManyNumber
    | AddErrorMessage;
}
