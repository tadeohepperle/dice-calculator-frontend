import type { Action, StateFromReducersMapObject } from "@reduxjs/toolkit";
import type { DiceIndex, InitSettings } from "../data_types";
import type { RootState } from "./reducer";

export interface AbstractAppStateAction<T> extends Action<string> {
  type: string;
  payload: T;
  // error?: boolean;
  // meta?: any;
}

export namespace Actions {
  ////////////////////////////////////////////////////////////////////////////////
  // ALL AVAILABLE ACTIONS
  ////////////////////////////////////////////////////////////////////////////////
  export type AppStateAction =
    | Reset
    | DeleteDice
    | AddDice
    | CalculateDistribution
    | AddErrorMessage
    | RawReduction
    | ChangeProbabilityQuery
    | ChangePercentileQuery;

  ////////////////////////////////////////////////////////////////////////////////
  // ACTION DEFINITIONS
  ////////////////////////////////////////////////////////////////////////////////

  // sometimes you just want to dispatch an action that tells the reducer exactly how to transform the state.
  export type RawReductionFunction = (state: RootState) => RootState;
  export interface RawReduction
    extends AbstractAppStateAction<RawReductionFunction> {
    type: "RawReduction";
  }
  export function rawReduction(
    reductionFunction: RawReductionFunction
  ): RawReduction {
    return { type: "RawReduction", payload: reductionFunction };
  }

  ////////////////////////////////////////////////////////////////////////////////

  export interface CalculateDistributionPayload {
    diceIndex: DiceIndex;
    inputValue: string;
  }
  export interface CalculateDistribution
    extends AbstractAppStateAction<CalculateDistributionPayload> {
    type: "CalculateDistribution";
  }
  export function calculateDistribution(
    diceIndex: DiceIndex,
    inputValue: string
  ): CalculateDistribution {
    return {
      type: "CalculateDistribution",
      payload: { diceIndex, inputValue },
    };
  }

  // ////////////////////////////////////////////////////////////////////////////////

  export type ResetPayload = Partial<InitSettings>;
  export interface Reset extends AbstractAppStateAction<ResetPayload> {
    type: "Reset";
  }
  export function reset(settings: ResetPayload): Reset {
    return { type: "Reset", payload: settings };
  }

  ////////////////////////////////////////////////////////////////////////////////

  export interface DeleteDicePayload {
    diceIndex: DiceIndex;
  }
  export interface DeleteDice
    extends AbstractAppStateAction<DeleteDicePayload> {
    type: "DeleteDice";
  }
  export function deleteDice(diceIndex: DiceIndex): DeleteDice {
    return { type: "DeleteDice", payload: { diceIndex } };
  }

  ////////////////////////////////////////////////////////////////////////////////

  export interface AddDicePayload {}
  export interface AddDice extends AbstractAppStateAction<{}> {
    type: "AddDice";
  }
  export function addDice(): AddDice {
    return { type: "AddDice", payload: {} };
  }

  ////////////////////////////////////////////////////////////////////////////////

  export type ChangeProbabilityQueryPayload = string;
  export interface ChangeProbabilityQuery
    extends AbstractAppStateAction<ChangeProbabilityQueryPayload> {
    type: "ChangeProbabilityQuery";
  }
  export function changeProbabilityQuery(
    input: string
  ): ChangeProbabilityQuery {
    return { type: "ChangeProbabilityQuery", payload: input };
  }

  ////////////////////////////////////////////////////////////////////////////////

  export type ChangePercentileQueryPayload = string;
  export interface ChangePercentileQuery
    extends AbstractAppStateAction<ChangePercentileQueryPayload> {
    type: "ChangePercentileQuery";
  }
  export function changePercentileQuery(input: string): ChangePercentileQuery {
    return { type: "ChangePercentileQuery", payload: input };
  }
  ////////////////////////////////////////////////////////////////////////////////

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

  ////////////////////////////////////////////////////////////////////////////////
}
