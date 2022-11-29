import { useSelector } from "react-redux";
import type {
  ALL_DICE_INDICES,
  DiceIndex,
  ChartMode,
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
import { formatPercent, last } from "../../logic/utils";
import { diceIndexToColor } from "./ui";
import SmallSelect from "./SmallSelect";

export interface Props {}

const DiceChartDisplay = (props: Props) => {
  let [mode, setMode] = useState<ChartMode>("pdf");
  const chartData: PdfAndCdfDistributionChartData | undefined = useSelector(
    (state: AppState) => {
      return state.chartData;
    }
  );

  const diceIndexToInputString = (i: DiceIndex): string =>
    chartData![mode].diceInputStrings[i]!;

  const lookUpFractionStringForToolTiop = (i: DiceIndex, n: number): string => {
    let d = chartData![mode];
    return d.data[n - d.min][`r${i}`] || "idk";
  };
  return (
    <div
      className="mt-6 text-white w-full relative"
      style={{ aspectRatio: "4/2", maxHeight: 300 }}
    >
      <div className="absolute -top-12 right-2 z-10">
        <SmallSelect
          value={mode}
          data={[
            ["pdf", "pmf"],
            ["cdf", "cdf"],
          ]}
          onChange={(e) => setMode(e as ChartMode)}
        ></SmallSelect>
      </div>
      {chartData && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData[mode].data}
            margin={{
              top: 0,
              right: 8,
              left: -20,
              bottom: 0,
            }}
          >
            {/* <CartesianGrid strokeDasharray="3 3" /s> */}
            <XAxis dataKey="title" stroke="white" />
            <YAxis stroke="white" />
            <Tooltip
              cursor={{
                fill: "rgba(255,255,255,0.2)",
              }}
              contentStyle={{
                background: "#0f172a",
                borderRadius: "8px",
                boxShadow: "0 5px 5px rgba(0, 0, 0, 0.25)",
                border: "none",
              }}
              labelFormatter={(label) => (
                <span className="font-bold">{label}</span>
              )}
              // @ts-ignore
              formatter={(value, diceIndex, props) => {
                // @ts-ignore
                let v = formatPercent(value);
                // @ts-ignore
                let rollValue = parseInt(props.payload.title);

                let frac = lookUpFractionStringForToolTiop(
                  diceIndex as DiceIndex,
                  rollValue
                );
                return [
                  <>
                    <span>
                      {v} <span className="ml-2 text-gray-400">({frac})</span>
                    </span>
                  </>,

                  diceIndexToInputString(diceIndex as DiceIndex),
                ];
              }}
            />
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
