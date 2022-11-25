import type {
  DiceIndex,
  JsDiceMaterialized,
  JsFractionMaterialized,
  ProbAll,
  RollResult,
} from "../data_types";
import type { Actions } from "../redux/actions";

export namespace WorkerMessages {
  export type WorkerMessage =
    | CalculateMessage
    | RollMessage
    | CalculateProbabilityMessage
    | CalculatePerccentileMessage;
  export type WorkerResponse =
    | CalculateResponse
    | RollResponse
    | CalculateProbabilityResponse
    | CalculatePerccentileResponse;

  export type PackedWorkerMessage<T extends WorkerMessage> = {
    id: number;
    message: T;
  };
  export type PackedWorkerResponse<T extends WorkerResponse> = {
    id: number;
    failed: boolean;
    message: T;
  };

  ////////////////////////////////////////////////////////////////////////////////
  // Different Messages and Corresponding Responses
  ////////////////////////////////////////////////////////////////////////////////

  /// calculate Dice:
  export interface CalculateMessage
    extends AbstractWorkerMessage<{
      diceIndex: DiceIndex;
      input: string;
      percentileQuery: number | undefined;
      probabilityQuery: number | undefined;
    }> {
    type: "Calculate";
  }
  export function calculateMessage(
    diceIndex: DiceIndex,
    input: string,
    percentileQuery: number | undefined,
    probabilityQuery: number | undefined
  ): CalculateMessage {
    return {
      type: "Calculate",
      payload: {
        diceIndex,
        input,
        percentileQuery,
        probabilityQuery,
      },
    };
  }
  export type CalculateResponse = AbstractWorkerResponse<
    JsDiceMaterialized,
    "Calculate"
  >;

  /// roll Dice:
  export interface RollMessage
    extends AbstractWorkerMessage<Actions.RollPayload> {
    type: "Roll";
  }
  export type RollResponse = AbstractWorkerResponse<RollResult, "Roll">;

  export function rollMessage(rollPayload: Actions.RollPayload): RollMessage {
    return {
      type: "Roll",
      payload: rollPayload,
    };
  }

  /// recalculate Probabilities:
  export interface CalculateProbabilityMessage
    extends AbstractWorkerMessage<
      {
        diceIndex: DiceIndex;
        probabilityQuery: number;
      }[]
    > {
    type: "CalculateProbability";
  }
  export function calculateProbabilityMessage(
    indicesAndProbablities: {
      diceIndex: DiceIndex;
      probabilityQuery: number;
    }[]
  ): CalculateProbabilityMessage {
    return {
      type: "CalculateProbability",
      payload: indicesAndProbablities,
    };
  }
  export type CalculateProbabilityResponse = AbstractWorkerResponse<
    {
      diceIndex: DiceIndex;
      probability: ProbAll | undefined;
    }[],
    "CalculateProbability"
  >;

  /// recalculate Percentiles:
  export interface CalculatePerccentileMessage
    extends AbstractWorkerMessage<
      {
        diceIndex: DiceIndex;
        percentileQuery: number;
      }[]
    > {
    type: "CalculatePercentile";
  }
  export function calculatePerccentileMessage(
    indicesAndPercentiles: {
      diceIndex: DiceIndex;
      percentileQuery: number;
    }[]
  ): CalculatePerccentileMessage {
    return {
      type: "CalculatePercentile",
      payload: indicesAndPercentiles,
    };
  }
  export type CalculatePerccentileResponse = AbstractWorkerResponse<
    {
      diceIndex: DiceIndex;
      percentile: number;
    }[],
    "CalculatePercentile"
  >;

  // I want to enforce these somehow by TypeScript but I think higher kinded types/generics would be needed for this.
  // export type WorkerMessageResponsePairs =
  //   | Pair<CalculateMessage, CalculateResponse>
  //   | Pair<RollMessage, RollResponse>;
  // type Pair<M, R> = {
  //   message: M;
  //   response: R;
  // };
}

type AbstractWorkerMessage<T> = {
  type: string;
  payload: T;
};

type AbstractWorkerResponse<T, S extends string> = {
  type: S;
  payload: T;
};
