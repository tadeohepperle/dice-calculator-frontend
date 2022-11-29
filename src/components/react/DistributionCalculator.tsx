import { Provider, useDispatch, useSelector } from "react-redux";
import {
  ALL_DICE_INDICES,
  ChartMode,
  ComparatorMode,
  DiceIndex,
  NumberMode,
} from "../../logic/data_types";
import { Actions } from "../../logic/redux/actions";
import type { AppState, CalculationState } from "../../logic/redux/state";
import DiceInputSegment from "./DiceInputSegment";
import DiceChartDisplay from "./DiceChartDisplay";
import DicePlot from "./DiceChartDisplay";
import DiceStatsDisplay from "./DiceStatsDisplay";
import IconButton from "./IconButton";
import InputField from "./InputField";

import { UIColor, Icons } from "./ui";
import { useEffect } from "react";

const DistributionCalculator = () => {
  const [segmentStates, numDicesCalculated]: [
    {
      diceIndex: DiceIndex;
      calculationState: CalculationState;
      initialInput: string;
    }[],
    number
  ] = useSelector((state: AppState) => {
    const segmentStates: {
      diceIndex: DiceIndex;
      calculationState: CalculationState;
      initialInput: string;
    }[] = state.segmentDisplayOrder.map((i) => {
      const { diceIndex, calculationState, initialInput } =
        state.inputSegments[i]!;
      return { diceIndex, calculationState, initialInput };
    });

    const numDicesCalculated = ALL_DICE_INDICES.filter(
      (i) => state.computedDices[i]
    ).length;

    return [segmentStates, numDicesCalculated];
  });
  const dispatch = useDispatch();
  return (
    <div>
      {segmentStates.map((e) => (
        <DiceInputSegment
          initialInput={e.initialInput}
          key={e.diceIndex}
          diceIndex={e.diceIndex}
          calculationState={e.calculationState}
        ></DiceInputSegment>
      ))}

      {segmentStates.length < 3 && (
        <IconButton
          className={"mt-5"}
          uiColor={UIColor.Ghost}
          title="Add dice to compare"
          icon={Icons.add}
          onClick={() => {
            dispatch(Actions.addDice());
          }}
          grow="none"
        ></IconButton>
      )}
      {numDicesCalculated > 0 && (
        <div className="block lg:flex lg:flex-wrap lg-flex-reverse">
          <div className="w-full"></div>
          <DiceChartDisplay></DiceChartDisplay>
          <DiceStatsDisplay></DiceStatsDisplay>
        </div>
      )}
      <div className="h-40"></div>
    </div>
  );
};

export default DistributionCalculator;
