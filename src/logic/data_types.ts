export type DiceIndex = 0 | 1 | 2;

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
  numer: BigInt;
  denom: BigInt;
  negative: boolean;
  float: number;
};

export type RollResult =
  | { type: "one"; number: number }
  | { type: "many"; numbers: number[] };
