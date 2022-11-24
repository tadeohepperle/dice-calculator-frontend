export type DiceIndex = 0 | 1 | 2;

export type JsDiceMaterialized = any;
// = Partial<{
//   // builder_string: string;
//   // min: number;
//   // max: number;
//   // mode: number[];
//   // median: number;
//   // mean: number;
//   // variance: number;
//   // distribution: any;
// }>;

export type JsFractionMaterialized = {
  numer: BigInt;
  denom: BigInt;
  negative: boolean;
  float: number;
};
