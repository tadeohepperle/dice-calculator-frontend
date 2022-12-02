import type { JsDice } from "dices";

export type DiceIndex = 0 | 1 | 2;
export const ALL_DICE_INDICES: [0, 1, 2] = [0, 1, 2];

export type Distribution = {
  values: [number, JsFractionMaterialized][];
};

export type JsDiceMaterialized = {
  build_time: number;
  builder_string: string; // created from dice_builder object
  original_builder_string: string; // real one from input
  min: bigint;
  max: bigint;
  mode: bigint[];
  median: bigint;
  mean: JsFractionMaterialized;
  variance: JsFractionMaterialized;
  distribution: Distribution; // TODO
  cumulative_distribution: Distribution; // TODO
  probabilityQuery: {
    query: number | undefined;
    result: ProbAll | undefined; // stands for loading
  };
  percentileQuery: {
    query: number | undefined;
    result: bigint | undefined; // stands for loading
  };
};

export type ProbAll = {
  lt: JsFractionMaterialized;
  lte: JsFractionMaterialized;
  eq: JsFractionMaterialized;
  gte: JsFractionMaterialized;
  gt: JsFractionMaterialized;
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

export type DistributionChartData = {
  min: number; // where values of the distribution start, e.g. 2 for 2d6
  max: number; // where values of the distribution end, e.g. 12 for 2d6
  availableDices: DiceIndex[];
  diceInputStrings: {
    [0]?: string;
    [1]?: string;
    [2]?: string;
  };
  data: {
    title: string;
    [0]?: number;
    [1]?: number;
    [2]?: number;
    r0?: string; // fraction string
    r1?: string; // fraction string
    r2?: string; // fraction string
  }[];
};

export type PdfAndCdfDistributionChartData = {
  pdf: DistributionChartData;
  cdf: DistributionChartData;
};

export type ComparatorMode = "lt" | "lte" | "eq" | "gte" | "gt";
export type NumberMode = "fraction" | "float";

export type ChartMode = "cdf" | "pdf";

export type InitSettings = {
  0?: string;
  1?: string;
  2?: string;
  perc: number;
  prob: number;
  cmpMode: ComparatorMode;
  numberMode: NumberMode;
  chartMode: ChartMode;
};

export type RollPayload = {
  diceIndex: DiceIndex;
  mode: { type: "one" } | { type: "many"; amount: number };
};

////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

// because the getters on JsDice are functions and not fields and are therefore not sent to the other thread.
export function materializeJsDice(
  jsDice: JsDice,
  probabilityQuery: number | undefined,
  percentileQuery: number | undefined,
  original_builder_string: string
): JsDiceMaterialized {
  // const jsDice = JsDice.build_from_string("2d6"); // REMOVE

  let probAll =
    probabilityQuery === undefined
      ? undefined
      : convertProbAll(jsDice.prob_all(BigInt(probabilityQuery)));

  let percentile =
    percentileQuery === undefined
      ? undefined
      : jsDice.quantile(percentileQuery / 100);

  const mode = Array(jsDice.mode.length)
    .fill(0)
    .map((e, i) => jsDice.mode[i]);

  // TODO: cumulative_distribution
  return {
    build_time: Number(jsDice.build_time),
    builder_string: jsDice.builder_string,
    original_builder_string,
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
      result: probAll,
    },
    percentileQuery: {
      query: percentileQuery,
      result: percentile, // TODO
    },
  };
}

export function convertProbAll(fromRust: JsFractionMaterialized[]): ProbAll {
  return {
    lt: fromRust[0],
    lte: fromRust[1],
    eq: fromRust[2],
    gte: fromRust[3],
    gt: fromRust[4],
  };
}
