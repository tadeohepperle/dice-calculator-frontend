import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ALL_DICE_INDICES,
  ComparatorMode,
  DiceIndex,
  JsDiceMaterialized,
  JsFractionMaterialized,
  NumberMode,
} from "../../logic/data_types";
import { Actions } from "../../logic/redux/actions";
import type { AppState } from "../../logic/redux/state";
import {
  formatFloat,
  formatFloatForPercent,
  formatFraction,
  formatPercent,
} from "../../logic/utils";
import SmallSelect from "./SmallSelect";
import { diceIndexToColor } from "./ui";
import LoadingSpinner from "./utility/LoadingSpinner";

export interface Props {}

const comparatorModeSymbolMap: Record<ComparatorMode, string> = {
  lt: "<",
  lte: "≤",
  eq: "=",
  gte: "≥",
  gt: ">",
};

const DiceStatsDisplay = (props: Props) => {
  const [comparatorMode, setComparatorMode] = useState<ComparatorMode>("eq");
  const [numberMode, setNumberMode] = useState<NumberMode>("fraction");

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

  const formatFunctionValue: (fraction: JsFractionMaterialized) => string =
    numberMode === "fraction" ? formatFraction : (v) => formatFloat(v.float, 2);
  const formatFunctionProbability: (
    fraction: JsFractionMaterialized
  ) => string =
    numberMode === "fraction"
      ? formatFraction
      : (v) => formatPercent(v.float, 2);
  return (
    <div
      // min-w-min
      className="mt-3 max-w-full flex justify-start md:justify-start w-full"
      style={{ overflowX: "auto" }}
    >
      <table
        className="text-white table-auto w-full"
        // style={{ maxWidth: `${160 + numDices * 160}px` }}
      >
        <thead>
          <tr className="w-full">
            <th className="py-2 text-end min-w-1/2">
              <SmallSelect
                value={numberMode}
                onChange={(v) => setNumberMode(v as NumberMode)}
                data={[
                  ["fraction", "fractions"],
                  ["float", "decimal"],
                ]}
              ></SmallSelect>
            </th>
            {createHeaderCellsFromDices(computedDices, numDices, (d, i) => (
              <span className="px-3" style={{ color: diceIndexToColor(i) }}>
                {numDices != 1 && spacer(6 - d.original_builder_string.length)}
                {d.original_builder_string}
                {numDices == 1 && spacer(10 - d.original_builder_string.length)}
                {numDices != 1 && spacer(6 - d.original_builder_string.length)}
              </span>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="bg-slate-600">
            <th className="text-right pr-3 py-1">Min</th>
            {createCellsFromDices(computedDices, numDices, (d) =>
              d.min.toString()
            )}
          </tr>
          <tr>
            <th className="text-right pr-3 py-1">Median</th>
            {createCellsFromDices(computedDices, numDices, (d) =>
              d.median.toString()
            )}
          </tr>
          <tr className="bg-slate-600">
            <th className="text-right pr-3 py-1">Max</th>
            {createCellsFromDices(computedDices, numDices, (d) =>
              d.max.toString()
            )}
          </tr>

          <tr>
            <th className="text-right pr-3 py-1">Mode</th>
            {createCellsFromDices(computedDices, numDices, (d) =>
              d.mode.join(", ")
            )}
          </tr>
          <tr className="bg-slate-600">
            <th className="text-right pr-3 py-1">Mean</th>
            {createCellsFromDices(computedDices, numDices, (d) =>
              formatFunctionValue(d.mean)
            )}
          </tr>
          <tr>
            <th className="text-right pr-3 py-1">Variance</th>
            {createCellsFromDices(computedDices, numDices, (d) =>
              formatFunctionValue(d.variance)
            )}
          </tr>

          <tr className="bg-slate-600">
            <th className="text-right pr-2 py-1">
              Probability
              <div className="flex py-1 justify-end">
                <SmallSelect
                  onChange={(v) => {
                    setComparatorMode(v as ComparatorMode);
                  }}
                  data={Object.keys(comparatorModeSymbolMap).map((k) => [
                    k,
                    comparatorModeSymbolMap[k as ComparatorMode],
                  ])}
                  value={comparatorMode}
                ></SmallSelect>

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
            {createCellsFromDices(computedDices, numDices, (d) => {
              let frac = d.probabilityQuery.result?.[comparatorMode];
              return frac && formatFunctionProbability(frac);
            })}
          </tr>
          <tr>
            <th className="text-right pr-2 py-1">
              Percentile (%)
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
            {createCellsFromDices(computedDices, numDices, (d) => {
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
  numDices: number,
  displayFunction: (dice: JsDiceMaterialized, diceIndex: DiceIndex) => any
) =>
  ALL_DICE_INDICES.map((i) => dices[i]).map((e, i) =>
    e === undefined ? (
      <td key={i}></td>
    ) : (
      <td key={i} className={numDices > 1 ? "text-center" : "text-start pl-5"}>
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
  numDices: number,
  displayFunction: (dice: JsDiceMaterialized, diceIndex: DiceIndex) => any
) =>
  ALL_DICE_INDICES.map((i) => dices[i]).map((e, i) =>
    e === undefined ? (
      <th key={i}></th>
    ) : (
      <th
        key={i}
        className={numDices > 1 ? "text-center py-1" : "text-start py-1 pl-2"}
      >
        {displayFunction(e, i as DiceIndex)}
      </th>
    )
  );

function spacer(nLetters: number) {
  return (
    <span className="select-none opacity-0">
      {"S".repeat(Math.max(0, nLetters))}
    </span>
  );
}
