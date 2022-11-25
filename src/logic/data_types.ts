import type { JsDice } from "dices";

export type DiceIndex = 0 | 1 | 2;
export const ALL_DICE_INDICES: [0, 1, 2] = [0, 1, 2];

export type JsDiceMaterialized = {
  build_time: number;
  builder_string: string;
  min: bigint;
  max: bigint;
  mode: bigint[];
  median: bigint;
  mean: JsFractionMaterialized;
  variance: JsFractionMaterialized;
  distribution: any; // TODO
  cumulative_distribution: any; // TODO
  probabilityQuery: {
    query: number;
    result: {
      lt: JsFractionMaterialized;
      lte: JsFractionMaterialized;
      eq: JsFractionMaterialized;
      gte: JsFractionMaterialized;
      gt: JsFractionMaterialized;
    };
  };
  percentileQuery: {
    query: number;
    result: number;
  };
};

export type DiceOperationQuery = { type: "prob"; value: number };
// TODO percentiles

export type JsFractionMaterialized = {
  string: string;
  float: number;
};

export type RollResult =
  | { type: "one"; number: number }
  | { type: "many"; numbers: number[] };

////////////////////////////////////////////////////////////////////////////////
// functions
////////////////////////////////////////////////////////////////////////////////

// because the getters on jsDice are functions and not fields and are therefore not sent to the other thread.
export function materializeJsDice(
  jsDice: JsDice,
  probabilityQuery: number,
  percentileQuery: number
): JsDiceMaterialized {
  // const jsDice = JsDice.build_from_string("2d6"); // REMOVE

  let prob_all: {
    lt: JsFractionMaterialized;
    lte: JsFractionMaterialized;
    eq: JsFractionMaterialized;
    gte: JsFractionMaterialized;
    gt: JsFractionMaterialized;
  } = jsDice.prob_all(BigInt(probabilityQuery));

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
    mean: jsDice.mean, //materializeJsFraction(jsDice.mean),
    variance: jsDice.variance, //materializeJsFraction(jsDice.variance),
    distribution: jsDice.distribution,
    cumulative_distribution: jsDice.cumulative_distribution,
    probabilityQuery: {
      query: probabilityQuery,
      result: prob_all,
    },
    percentileQuery: {
      query: percentileQuery,
      result: 7, // TODO
    },
  };
}

// // because the getters on jsFraction are functions and not fields and are therefore not sent to the other thread.
// export function materializeJsFraction(jsFraction: JsFraction) {
//   return {
//     string: jsFraction.string,
//     float: jsFraction.float,
//   };
// }
