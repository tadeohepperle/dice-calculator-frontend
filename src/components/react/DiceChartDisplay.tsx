import { useSelector } from "react-redux";
import type {
  ALL_DICE_INDICES,
  DiceIndex,
  Distribution,
  JsDiceMaterialized,
  JsFractionMaterialized,
  PdfAndCdfDistributionChartData,
} from "../../logic/data_types";
import type { AppState } from "../../logic/redux/state";

import { useState } from "react";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { last } from "../../logic/utils";
import { diceIndexToColor } from "./ui";

export interface Props {}

type DisplayMode = "cdf" | "pdf";

const DiceChartDisplay = (props: Props) => {
  let [mode, setMode] = useState<DisplayMode>("cdf");
  const chartData: PdfAndCdfDistributionChartData | undefined = useSelector(
    (state: AppState) => {
      return state.chartData;
    }
  );

  const width = 200;
  const height = 200;
  const verticalMargin = 40;

  return (
    <div className=" text-white rounded" style={{ width: "100%", height: 300 }}>
      {chartData && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={chartData[mode].data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartData[mode].availableDices.map((i) => (
              <Bar key={i} dataKey={i} fill={diceIndexToColor(i)} />
            ))}
            {/* <Bar dataKey={0} fill={diceIndexToColor(0)} />; */}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DiceChartDisplay;

// function createChartDataFromDistributions(
//   distributions: Distributions,
//   mode: DisplayMode
// ): {
//   name: string;
//   [0]?: number;
//   [1]?: number;
//   [2]?: number;
// }[] {
//   let min: number = Math.min(
//     ...ALL_DICE_INDICES.map(
//       (i) => distributions[i]?.[mode].values?.[0][0] || Infinity
//     )
//   );

//   let max: number = Math.max(
//     ...ALL_DICE_INDICES.map(
//       (i) => last(distributions[i]?.[mode].values)?.[0] || -Infinity
//     )
//   );
//   let agg: Map<number, Map<DiceIndex, JsFractionMaterialized>> = new Map();

//   for (let i = min; i <= max; i++) {
//     agg.set(i, new Map());
//   }
//   let validDiceIndices = ALL_DICE_INDICES.filter(
//     (i) => distributions[i] !== undefined
//   );
//   for (const diceIndex of validDiceIndices) {
//     for (const kv of distributions[diceIndex]![mode].values) {
//       const [val, frac] = kv;
//       agg.get(val)!.set(diceIndex, frac);
//     }
//   }

//   return Array(max - min + 1)
//     .fill(0)
//     .map((e, i) => i + min)
//     .map((i) => {
//       let o: {
//         name: string;
//         [0]?: number;
//         [1]?: number;
//         [2]?: number;
//       } = {
//         name: `Page ${i}`,
//       };
//       for (const diceIndex of validDiceIndices) {
//         o[diceIndex] = agg.get(i)?.get(diceIndex)?.float;
//       }
//       return o;
//     });
// }
