import { useSelector } from "react-redux";
import {
  ALL_DICE_INDICES,
  DiceIndex,
  Distribution,
  Distributions,
  JsDiceMaterialized,
  JsFractionMaterialized,
} from "../../logic/data_types";
import { AppState, getDistributions } from "../../logic/redux/state";
export interface Props {
  distributions: Distributions;
}
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

type DisplayMode = "cdf" | "pdf";

const DiceChartDisplay = (props: Props) => {
  let [mode, setMode] = useState<DisplayMode>("cdf");
  const [pdfData, cdfData] = useSelector((state: AppState) => {
    let distributions = getDistributions(state);

    return [
      createChartDataFromDistributions(distributions, "pdf"),
      createChartDataFromDistributions(distributions, "cdf"),
    ];
  });

  let [n, setN] = useState(10);

  const width = 200;
  const height = 200;
  const verticalMargin = 40;

  return (
    <div className=" text-white rounded" style={{ width: "100%", height: 300 }}>
      <button
        onClick={() => {
          setN(n + 1);
        }}
      >
        CLick to add {n}
      </button>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={pdfData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={0} fill="#8884d8" />
          {/* <Bar dataKey="d2" fill="#82ca9d" /> */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DiceChartDisplay;

function createChartDataFromDistributions(
  distributions: Distributions,
  mode: DisplayMode
): {
  name: string;
  [0]?: number;
  [1]?: number;
  [2]?: number;
}[] {
  let min: number = Math.min(
    ...ALL_DICE_INDICES.map(
      (i) => distributions[i]?.[mode].values?.[0][0] || Infinity
    )
  );

  let max: number = Math.max(
    ...ALL_DICE_INDICES.map(
      (i) => last(distributions[i]?.[mode].values)?.[0] || -Infinity
    )
  );
  let agg: Map<number, Map<DiceIndex, JsFractionMaterialized>> = new Map();

  for (let i = min; i <= max; i++) {
    agg.set(i, new Map());
  }
  let validDiceIndices = ALL_DICE_INDICES.filter(
    (i) => distributions[i] !== undefined
  );
  for (const diceIndex of validDiceIndices) {
    for (const kv of distributions[diceIndex]![mode].values) {
      const [val, frac] = kv;
      agg.get(val)!.set(diceIndex, frac);
    }
  }

  return Array(max - min + 1)
    .fill(0)
    .map((e, i) => i + min)
    .map((i) => {
      let o: {
        name: string;
        [0]?: number;
        [1]?: number;
        [2]?: number;
      } = {
        name: `Page ${i}`,
      };
      for (const diceIndex of validDiceIndices) {
        o[diceIndex] = agg.get(i)?.get(diceIndex)?.float;
      }
      return o;
    });
}
