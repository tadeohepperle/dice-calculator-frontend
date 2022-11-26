import type { PdfAndCdfDistributionChartData } from "./../data_types";
import { greet, JsDice } from "dices";
import {
  ALL_DICE_INDICES,
  convertProbAll,
  DiceIndex,
  JsDiceMaterialized,
  JsFractionMaterialized,
  materializeJsDice,
  ProbAll,
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

const diceInputSegmentsShown: Record<DiceIndex, boolean> = {
  0: false,
  1: false,
  2: false,
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
  RemoveDice: (msg) =>
    removeDiceHandler((msg as WorkerMessages.RemoveDiceMessage).payload),
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
    if (cached !== undefined) {
      let [oldInput, dice, materialized] = cached!;
      if (oldInput == input || dice.builder_string == input) {
        // this is a hit! Copy dice information over to the requested slot.
        // avoids having to recompute dice
        const sameDiceDifferentSlot: boolean = i != diceIndex;
        if (sameDiceDifferentSlot) {
          diceCache[diceIndex] = [input, dice, materialized];
        }
        // if the cache hit was not from the same slot as requested, we need to recalculate distributions
        const chartData = sameDiceDifferentSlot
          ? calculateChartData()
          : "unchanged";

        diceInputSegmentsShown[diceIndex] = true;
        return {
          type: "Calculate",
          payload: { dice: materialized, chartData },
        };
      }
    }
  }

  // construct the dice, potentially resource intensive and could take several seconds, for example for 3d2000
  const dice = JsDice.build_from_string(input);
  const materialized = materializeJsDice(
    dice,
    probabilityQuery,
    percentileQuery,
    input
  );

  // cache it for future use.
  diceCache[diceIndex] = [input, dice, materialized];

  let chartData = calculateChartData();

  diceInputSegmentsShown[diceIndex] = true;
  return {
    type: "Calculate",
    payload: { dice: materialized, chartData },
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
  let returnvalues: {
    diceIndex: DiceIndex;
    probability: ProbAll | undefined;
  }[] = payload.map((p) => {
    const { diceIndex, probabilityQuery } = p;
    let dice = diceCache[diceIndex]?.[1];
    if (!dice) {
      return { diceIndex, probability: undefined };
    } else {
      let probAllFromRust = dice.prob_all(BigInt(probabilityQuery));
      let probAll = convertProbAll(probAllFromRust);
      return { diceIndex, probability: probAll };
    }
  });
  return {
    type: "CalculateProbability",
    payload: returnvalues,
  };
}

function calculatePercentileHandler(
  payload: WorkerMessages.CalculatePerccentileMessage["payload"]
): WorkerMessages.CalculatePerccentileResponse {
  let returnvalues: {
    diceIndex: DiceIndex;
    percentile: bigint | undefined;
  }[] = payload.map((p) => {
    const { diceIndex, percentileQuery } = p;
    let dice = diceCache[diceIndex]?.[1];
    if (!dice) {
      return { diceIndex, percentile: undefined };
    } else {
      let percentile = dice.quantile(percentileQuery / 100);
      return { diceIndex, percentile };
    }
  });
  return { type: "CalculatePercentile", payload: returnvalues };
}

function removeDiceHandler(
  payload: WorkerMessages.RemoveDiceMessage["payload"]
): WorkerMessages.RemoveDiceResponse {
  // the task of this function is to possibly recalculate the chartData
  // if a dice represented in the chartdata was removed
  // notice: if the dice input segment was removed
  // but no dice had been calculated in the first place we can just return "unchanged"

  if (!diceCache[payload.diceIndex]) {
    return { type: "RemoveDice", payload: { chartData: "unchanged" } };
  }
  // we DO NOT remove the calculated dice from the cache though:
  // it could be useful to keep them around for later, they will just not be displayed.
  let chartData = calculateChartData();
  return { type: "RemoveDice", payload: { chartData } };
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

function calculateChartData(): PdfAndCdfDistributionChartData {
  // get min and max values that delimit the chart:
  // pdf and cdf should have the same max values

  // let min = ALL_DICE_INDICES.map(i =>
  //  diceCache[i]?.[2].  || Infinity

  //   )

  throw "not implemented";
}

// function  sasasadds( a: {
//   0?: Distribution,
//   1?: Dis
// })
