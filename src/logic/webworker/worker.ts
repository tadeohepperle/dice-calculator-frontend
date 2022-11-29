import type {
  DistributionChartData,
  PdfAndCdfDistributionChartData,
} from "./../data_types";
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
import { last } from "../utils";

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
postMessage({ id: 2, type: "setupsuccess" });

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
        diceInputSegmentsShown[diceIndex] = true;
        // if the cache hit was not from the same slot as requested, we need to recalculate distributions
        const chartData = sameDiceDifferentSlot
          ? calculateChartData()!
          : "unchanged";

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
  diceInputSegmentsShown[diceIndex] = true;

  let chartData = calculateChartData()!;

  return {
    type: "Calculate",
    payload: { dice: materialized, chartData },
  };
}

function rollHandler(
  payload: WorkerMessages.RollMessage["payload"]
): WorkerMessages.RollResponse {
  let dice = diceCache[payload.diceIndex]?.[1];
  if (!dice) {
    throw `dice with diceIndex ${payload.diceIndex} cannot be found in diceCache.`;
  }
  switch (payload.mode.type) {
    case "one": {
      let num = dice.roll();
      return {
        type: "Roll",
        payload: { type: "one", number: Number(num) },
      };
    }
    case "many": {
      let p = payload.mode as { type: "many"; amount: number };
      let nums = dice.roll_many(p.amount);
      let numbers: number[] = [];
      nums.forEach((b) => {
        numbers.push(Number(b));
      });
      return {
        type: "Roll",
        payload: { type: "many", numbers },
      };
    }
  }
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
  diceInputSegmentsShown[payload.diceIndex] = false;
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

/**
 * the context in which this function is called that at least one dice is present in the dice cache i
 * and for this dice diceInputSegmentsShown[i] must be true
 */
function calculateChartData(): PdfAndCdfDistributionChartData | undefined {
  // get min and max values that delimit the chart:
  // pdf and cdf should have the same max values

  const RELEVANT_DICE_INDICES = ALL_DICE_INDICES.filter(
    (i) => diceInputSegmentsShown[i] && diceCache[i] !== undefined
  );
  if (RELEVANT_DICE_INDICES.length == 0) {
    return undefined;
  }

  let min = Math.min(
    ...RELEVANT_DICE_INDICES.map(
      (i) => diceCache[i]?.[2].distribution.values[0]?.[0] || Infinity
    )
  );

  let max = Math.max(
    ...RELEVANT_DICE_INDICES.map(
      (i) => last(diceCache[i]?.[2].distribution.values)?.[0] || -Infinity
    )
  );

  let pdfAgg: Map<number, Map<DiceIndex, JsFractionMaterialized>> = new Map();
  let cdfAgg: Map<number, Map<DiceIndex, JsFractionMaterialized>> = new Map();

  // fill maps with empty maps for each number:
  for (let i = min; i <= max; i++) {
    pdfAgg.set(i, new Map());
    cdfAgg.set(i, new Map());
  }

  // fill submaps with the actual values:
  for (const diceIndex of RELEVANT_DICE_INDICES) {
    for (
      let i = 0;
      i < diceCache[diceIndex]![2].distribution.values.length;
      i++
    ) {
      const [val, pdf_frac] = diceCache[diceIndex]![2].distribution.values[i];
      const [_, cdf_frac] =
        diceCache[diceIndex]![2].cumulative_distribution.values[i];
      // assert val === _
      pdfAgg.get(val)!.set(diceIndex, pdf_frac);
      cdfAgg.get(val)!.set(diceIndex, cdf_frac);
    }
  }
  // go over cdf to fill in missing values:
  let lastVal: Map<DiceIndex, JsFractionMaterialized | undefined> = new Map();
  for (const diceIndex of RELEVANT_DICE_INDICES) {
    lastVal.set(diceIndex, { string: "0", float: 0.0 });
  }
  for (let i = min; i <= max; i++) {
    let cdfMapRef = cdfAgg.get(i);
    for (const diceIndex of RELEVANT_DICE_INDICES) {
      let v = cdfMapRef!.get(diceIndex);
      if (v === undefined) {
        let lv = lastVal.get(diceIndex);
        if (lv !== undefined) {
          cdfMapRef!.set(diceIndex, lv);
        }
      } else {
        lastVal.set(diceIndex, v);
      }
    }
  }

  let pdf = transformHashMapToChartData(
    pdfAgg,
    min,
    max,
    RELEVANT_DICE_INDICES
  );

  let cdf = transformHashMapToChartData(
    cdfAgg,
    min,
    max,
    RELEVANT_DICE_INDICES
  );
  return { cdf, pdf };
}

function transformHashMapToChartData(
  hashmap: Map<number, Map<DiceIndex, JsFractionMaterialized>>,
  min: number,
  max: number,
  availableDices: DiceIndex[]
): DistributionChartData {
  const data = Array(max - min + 1)
    .fill(0)
    .map((e, i) => i + min)
    .map((i) => {
      let o: {
        title: string;
        [0]?: number;
        [1]?: number;
        [2]?: number;
        r0?: string;
        r1?: string;
        r2?: string;
      } = {
        title: `${i}`,
      };
      for (const diceIndex of availableDices) {
        let fracMat = hashmap.get(i)?.get(diceIndex);
        o[diceIndex] = fracMat?.float;
        o[`r${diceIndex}`] = fracMat?.string;
      }
      return o;
    });

  const diceInputStrings: Partial<Record<DiceIndex, string>> = {};
  availableDices.forEach(
    (i) => (diceInputStrings[i] = diceCache[i]![2].original_builder_string)
  );
  return {
    availableDices,
    data,
    diceInputStrings,
    min,
    max,
  };
}
