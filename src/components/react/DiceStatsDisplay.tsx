import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ALL_DICE_INDICES,
  DiceIndex,
  JsDiceMaterialized,
} from "../../logic/data_types";
import { Actions } from "../../logic/redux/actions";
import type { AppState } from "../../logic/redux/state";

export interface Props {}

type ComparatorMode = "lt" | "lte" | "eq" | "gte" | "gt";

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
  const dispatch = useDispatch();

  return (
    <div className="min-w-min">
      <table>
        <thead>
          <tr>
            <th>Stat</th>
            {createHeaderCellsFromDices(
              computedDices,
              (d) => d.original_builder_string
            )}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Mean</th>
            {createCellsFromDices(computedDices, (d) => formatFraction(d.mean))}
          </tr>
          <tr>
            <th>Variance</th>
            {createCellsFromDices(computedDices, (d) =>
              formatFraction(d.variance)
            )}
          </tr>
          <tr>
            <th>Median</th>
            {createCellsFromDices(computedDices, (d) => d.median.toString())}
          </tr>
          <tr>
            <th>Mode</th>
            {createCellsFromDices(computedDices, (d) => d.mode.join(", "))}
          </tr>

          <tr>
            <th>Min</th>
            {createCellsFromDices(computedDices, (d) => d.min.toString())}
          </tr>
          <tr>
            <th>Max</th>
            {createCellsFromDices(computedDices, (d) => d.max.toString())}
          </tr>
          <tr>
            <th>
              <div className="flex">
                Probability
                <input
                  onChange={(e) => {
                    try {
                      dispatch(Actions.changeProbabilityQuery(e.target.value));
                    } catch (ex) {
                      console.log(ex); // should never happen
                    }
                  }}
                  type="number"
                  id="first_name"
                  className="
                  w-16 pr-1 pl-3 py-1 ring-0
        ml-2 text-sm
        input-shadow
        appearance-none 
        leading-tight
        bg-slate-900 font-bold
        transition-all
         text-white rounded-lg block"
                  inputMode="numeric"
                  value={probabilityQuery}
                />
              </div>
            </th>
            {createCellsFromDices(computedDices, (d) => {
              const result = d.probabilityQuery.result;
              if (result === undefined) {
                return "loading";
              } else {
                return result[comparatorMode].string;
              }
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DiceStatsDisplay;

const createCellsFromDices = (
  dices: Record<DiceIndex, JsDiceMaterialized | undefined>,
  displayFunction: (dice: JsDiceMaterialized) => string
) =>
  ALL_DICE_INDICES.map((i) => dices[i]).map((e, i) =>
    e === undefined ? <td key={i}></td> : <td key={i}>{displayFunction(e)}</td>
  );

const createHeaderCellsFromDices = (
  dices: Record<DiceIndex, JsDiceMaterialized | undefined>,
  displayFunction: (dice: JsDiceMaterialized) => string
) =>
  ALL_DICE_INDICES.map((i) => dices[i]).map((e, i) =>
    e === undefined ? <th key={i}></th> : <th key={i}>{displayFunction(e)}</th>
  );

const formatFraction = (fraction: { string: string; float: number }) =>
  fraction.string;
