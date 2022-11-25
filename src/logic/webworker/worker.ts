import { greet, JsDice, JsFraction } from "dices";
import {
  ALL_DICE_INDICES,
  DiceIndex,
  JsDiceMaterialized,
  JsFractionMaterialized,
  materializeJsDice,
} from "../data_types";
import type { WorkerMessages } from "./worker_messages";

////////////////////////////////////////////////////////////////////////////////
// KEEPING STATE
////////////////////////////////////////////////////////////////////////////////

const diceCache: Record<
  DiceIndex,
  [string, JsDice, JsDiceMaterialized] | undefined
> = {
  0: undefined,
  1: undefined,
  2: undefined,
};

////////////////////////////////////////////////////////////////////////////////
// EVENT HANDLING
////////////////////////////////////////////////////////////////////////////////

let messageResponseFunctionMap: Record<
  WorkerMessages.WorkerMessage["type"],
  (message: WorkerMessages.WorkerMessage) => WorkerMessages.WorkerResponse
> = {
  Calculate: (msg) =>
    calculateHandler((msg as WorkerMessages.CalculateMessage).payload),
  CalculatePercentile: (msg) =>
    calculatePercentileHandler(
      (msg as WorkerMessages.CalculatePerccentileMessage).payload
    ),
  CalculateProbability: (msg) =>
    calculateProbabilityHandler(
      (msg as WorkerMessages.CalculateProbabilityMessage).payload
    ),
  Roll: (msg) => rollHandler((msg as WorkerMessages.RollMessage).payload),
};

onmessage = function (e) {
  const { id, message } = e.data as WorkerMessages.PackedWorkerMessage<any>;
  try {
    if (!id || !message) {
      return postFail(
        id,
        `id or message fields missing on event.data: ${JSON.stringify(e.data)}`
      );
    }
    const type = message.type as WorkerMessages.WorkerMessage["type"];
    if (!type) {
      return postFail(
        id,
        `message: ${JSON.stringify(
          message
        )} has no field 'type' but it is required.`
      );
    }

    let result = messageResponseFunctionMap[type](message);
    postSuccess(id, result);
  } catch (ex) {
    console.error(ex);
    postFail(id, ex);
  }
};

////////////////////////////////////////////////////////////////////////////////
// ACTION HANDLERS
////////////////////////////////////////////////////////////////////////////////

function calculateHandler(
  payload: WorkerMessages.CalculateMessage["payload"]
): WorkerMessages.CalculateResponse {
  const { input, diceIndex, probabilityQuery, percentileQuery } = payload;
  // check cache:
  for (const i of ALL_DICE_INDICES) {
    let cached = diceCache[i];
    if (cached) {
      let [oldInput, dice, materialized] = cached!;
      if (oldInput == input || dice.builder_string == input) {
        // this is a hit!
        diceCache[diceIndex] = [input, dice, materialized];
        return {
          type: "Calculate",
          payload: materialized,
        };
      }
    }
  }

  // construct the dice, potentially resource intensive and could take several seconds, for example for 3d2000
  const dice = JsDice.build_from_string(input);
  const materialized = materializeJsDice(
    dice,
    probabilityQuery,
    percentileQuery
  );
  // cache it for future use.
  diceCache[diceIndex] = [input, dice, materialized];
  return {
    type: "Calculate",
    payload: materialized,
  };
}

function rollHandler(
  payload: WorkerMessages.RollMessage["payload"]
): WorkerMessages.RollResponse {
  throw "not implemented";
}

function calculateProbabilityHandler(
  payload: WorkerMessages.CalculateProbabilityMessage["payload"]
): WorkerMessages.CalculateProbabilityResponse {
  throw "not implemented";
}

function calculatePercentileHandler(
  payload: WorkerMessages.CalculatePerccentileMessage["payload"]
): WorkerMessages.CalculatePerccentileResponse {
  throw "not implemented";
}

////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

function postFail(id: number, message: any) {
  self.postMessage({ failed: true, id, message });
}

function postSuccess(id: number, message: WorkerMessages.WorkerResponse) {
  self.postMessage({ failed: false, id, message });
}

// function jsDiceFromPtr(ptr) {
//   const obj = Object.create(JsDice.prototype);
//   obj.ptr = ptr;
//   return obj;
// }
