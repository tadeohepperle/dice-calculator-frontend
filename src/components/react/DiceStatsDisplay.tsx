import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ALL_DICE_INDICES,
  DiceIndex,
  JsDiceMaterialized,
} from "../../logic/data_types";
import { Actions } from "../../logic/redux/actions";
import type { AppState } from "../../logic/redux/state";
import { diceIndexToColor } from "./ui";
import LoadingSpinner from "./utility/LoadingSpinner";

export interface Props {}

type ComparatorMode = "lt" | "lte" | "eq" | "gte" | "gt";
const comparatorModeSymbolMap: Record<ComparatorMode, string> = {
  lt: "<",
  lte: "≤",
  eq: "=",
  gte: "≥",
  gt: ">",
};

const DiceStatsDisplay = (props: Props) => {
  const [comparatorMode, setComparatorMode] = useState<ComparatorMode>("eq");
  const { computedDices, probabilityQuery, percentileQuery } = useSelector(
    (state: AppState) => {
      return {
        computedDices: state.computedDices,
        probabilityQuery: state.probabilityQuery,
        percentileQuery: state.percentileQuery,
      };
    }
  );
  const numDices = ALL_DICE_INDICES.filter(
    (i) => computedDices[i] !== undefined
  ).length;
  const dispatch = useDispatch();
  console.log(`${numDices * 200}px`);
  return (
    <div
      // min-w-min
      className="mt-3 w-full flex justify-start md:justify-start"
      style={{ overflowX: "auto" }}
    >
      <table
        className="text-white table-auto "
        style={{ maxWidth: `${160 + numDices * 140}px` }}
      >
        <thead>
          <tr>
            <th></th>
            {createHeaderCellsFromDices(computedDices, (d, i) => (
              <span className="px-3" style={{ color: diceIndexToColor(i) }}>
                {d.original_builder_string}
              </span>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-slate-600">
            <th className="text-right pr-3 py-1 w-40">Mean</th>
            {createCellsFromDices(computedDices, (d) => formatFraction(d.mean))}
          </tr>
          <tr>
            <th className="text-right pr-3 py-1">Variance</th>
            {createCellsFromDices(computedDices, (d) =>
              formatFraction(d.variance)
            )}
          </tr>
          <tr className="bg-slate-600">
            <th className="text-right pr-3 py-1">Median</th>
            {createCellsFromDices(computedDices, (d) => d.median.toString())}
          </tr>
          <tr>
            <th className="text-right pr-3 py-1">Mode</th>
            {createCellsFromDices(computedDices, (d) => d.mode.join(", "))}
          </tr>

          <tr className="bg-slate-600">
            <th className="text-right pr-3 py-1">Min</th>
            {createCellsFromDices(computedDices, (d) => d.min.toString())}
          </tr>
          <tr>
            <th className="text-right pr-3 py-1">Max</th>
            {createCellsFromDices(computedDices, (d) => d.max.toString())}
          </tr>
          <tr className="bg-slate-600">
            <th className="text-right pr-2 py-1">
              Probability
              <div className="flex py-1 justify-end">
                <select
                  name="mode"
                  id="modeSelect"
                  className="ml-2 h-6 ring-0 px-1 pb-1 pt-0 input-shadow leading-tight bg-slate-900 font-bold transition-all  text-white rounded-lg"
                  value={comparatorMode}
                  onChange={(e) => {
                    setComparatorMode(e.target.value as ComparatorMode);
                  }}
                >
                  {Object.keys(comparatorModeSymbolMap).map((k) => (
                    <option value={k} key={k}>
                      {comparatorModeSymbolMap[k as ComparatorMode]}
                    </option>
                  ))}
                </select>
                <input
                  onChange={(e) =>
                    dispatch(Actions.changeProbabilityQuery(e.target.value))
                  }
                  type="number"
                  className="h-6 text-sm w-16 pr-1 pl-3 py-1 ring-0 ml-2 input-shadow appearance-none leading-tight bg-slate-900 font-bold transition-all  text-white rounded-lg block"
                  inputMode="numeric"
                  value={probabilityQuery}
                />
              </div>
            </th>
            {createCellsFromDices(computedDices, (d) => {
              return d.probabilityQuery.result?.[comparatorMode]?.string;
            })}
          </tr>
          <tr>
            <th className="text-right pr-2 py-1">
              Percentile
              <div className="flex justify-end py-1">
                <input
                  onChange={(e) =>
                    dispatch(Actions.changePercentileQuery(e.target.value))
                  }
                  type="number"
                  className="h-6 w-16 pr-1 pl-3 py-1 ring-0 ml-2 text-sm input-shadow appearance-none leading-tight bg-slate-900 font-bold transition-all  text-white rounded-lg block"
                  inputMode="decimal"
                  value={percentileQuery}
                />
              </div>
            </th>
            {createCellsFromDices(computedDices, (d) => {
              return d.percentileQuery.result?.toString();
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DiceStatsDisplay;

// the appear-late class on the loading spinner is added to remove flicker in case of very fast updates < 70ms.
const createCellsFromDices = (
  dices: Record<DiceIndex, JsDiceMaterialized | undefined>,
  displayFunction: (dice: JsDiceMaterialized, diceIndex: DiceIndex) => any
) =>
  ALL_DICE_INDICES.map((i) => dices[i]).map((e, i) =>
    e === undefined ? (
      <td key={i}></td>
    ) : (
      <td key={i} className="text-center">
        {displayFunction(e, i as DiceIndex) || (
          <div className="appear-later flex items-center justify-center">
            <LoadingSpinner className="text-slate-900 fill-gray-300"></LoadingSpinner>
          </div>
        )}
      </td>
    )
  );

const createHeaderCellsFromDices = (
  dices: Record<DiceIndex, JsDiceMaterialized | undefined>,
  displayFunction: (dice: JsDiceMaterialized, diceIndex: DiceIndex) => any
) =>
  ALL_DICE_INDICES.map((i) => dices[i]).map((e, i) =>
    e === undefined ? (
      <th key={i}></th>
    ) : (
      <th key={i} className="text-center py-1">
        {displayFunction(e, i as DiceIndex)}
      </th>
    )
  );

const formatFraction = (fraction: { string: string; float: number }) =>
  fraction.string;
