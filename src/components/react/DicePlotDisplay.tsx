import { useSelector } from "react-redux";
import {
  ALL_DICE_INDICES,
  DiceIndex,
  JsDiceMaterialized,
} from "../../logic/data_types";
import type { AppState } from "../../logic/redux/state";
export interface Props {
  //  distributions: {0?: JsDiceMaterialized}
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

function createData(n: number) {
  return Array(n)
    .fill(0)
    .map((e, i) => ({
      name: `Page ${i}`,
      d1: Math.sin(i / 10) + (1 * 10) / n,
      d2: Math.cos(i / 10) + (1 * 10) / n,
    }));
}

const DicePlotDisplay = (props: Props) => {
  const computedDices = useSelector((state: AppState) => {
    return state.computedDices;
  });

  let [n, setN] = useState(10);
  let [data, setData] = useState(createData(10));

  const width = 200;
  const height = 200;
  const verticalMargin = 40;

  return (
    <div
      className="bg-black text-white rounded"
      style={{ width: "100%", height: 300 }}
    >
      <button
        onClick={() => {
          setN(n + 1);
          setData(createData(n));
        }}
      >
        CLick to add {n}
      </button>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
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
          <Bar dataKey="d1" fill="#8884d8" />
          <Bar dataKey="d2" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DicePlotDisplay;
