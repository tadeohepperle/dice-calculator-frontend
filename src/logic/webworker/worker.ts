import { greet, JsDice, JsFraction } from "dices";
import type { JsDiceMaterialized, JsFractionMaterialized } from "../data_types";
import type { WorkerMessages } from "./worker_messages";

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
  const { input, diceIndex, probability_query, percentile_query } = payload;
  const dice = JsDice.build_from_string(input);
  console.log(`built dice from ${input} and rolled ${dice.roll()}`);

  let diceMaterialized = materializeJsDice(
    dice,
    probability_query,
    percentile_query
  );
  return { type: "Calculate", payload: diceMaterialized };
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

// because the getters on jsDice are functions and not fields and are therefore not sent to the other thread.
function materializeJsDice(
  jsDice: JsDice,
  probability_query: number,
  percentile_query: number
): JsDiceMaterialized {
  // const jsDice = JsDice.build_from_string("2d6"); // REMOVE

  let prob_all: {
    lt: JsFractionMaterialized;
    lte: JsFractionMaterialized;
    eq: JsFractionMaterialized;
    gte: JsFractionMaterialized;
    gt: JsFractionMaterialized;
  } = jsDice.prob_all(BigInt(probability_query));

  const mode = Array(jsDice.mode.length)
    .fill(0)
    .map((e, i) => jsDice.mode[i]);

  // TODO: cumulative_distribution
  return {
    build_time: Number(jsDice.build_time),
    builder_string: jsDice.builder_string,
    min: jsDice.min,
    max: jsDice.max,
    mode,
    median: jsDice.median,
    mean: materializeJsFraction(jsDice.mean),
    variance: materializeJsFraction(jsDice.variance),
    distribution: jsDice.distribution,
    cumulative_distribution: jsDice.cumulative_distribution,
    probability_query: {
      query: probability_query,
      result: prob_all,
    },
    percentile_query: {
      query: percentile_query,
      result: 7, // TODO
    },
  };
}

// because the getters on jsFraction are functions and not fields and are therefore not sent to the other thread.
function materializeJsFraction(jsFraction: JsFraction) {
  return {
    numer: jsFraction.numer,
    denom: jsFraction.denom,
    negative: jsFraction.negative,
    float: jsFraction.float,
  };
}

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
