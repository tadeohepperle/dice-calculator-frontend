import { Provider, useDispatch, useSelector } from "react-redux";
import { ALL_DICE_INDICES, DiceIndex } from "../../logic/data_types";
import { Actions } from "../../logic/redux/actions";
import type { AppState, CalculationState } from "../../logic/redux/state";
import DiceInputSegment from "./DiceInputSegment";
import DiceChartDisplay from "./DiceChartDisplay";
import DicePlot from "./DiceChartDisplay";
import DiceStatsDisplay from "./DiceStatsDisplay";
import IconButton from "./IconButton";
import InputField from "./InputField";

import { UIColor, Icons } from "./ui";

const DistributionCalculator = () => {
  const [segmentStates, numDicesCalculated]: [
    {
      diceIndex: DiceIndex;
      calculationState: CalculationState;
    }[],
    number
  ] = useSelector((state: AppState) => {
    const segmentStates: {
      diceIndex: DiceIndex;
      calculationState: CalculationState;
    }[] = state.segmentDisplayOrder.map((i) => {
      const { diceIndex, calculationState } = state.inputSegments[i]!;
      return { diceIndex, calculationState };
    });

    const numDicesCalculated = ALL_DICE_INDICES.filter(
      (i) => state.computedDices[i]
    ).length;

    const distributionsArr = ALL_DICE_INDICES.map((i) =>
      state.computedDices[i] === undefined
        ? undefined
        : {
            cdf: state.computedDices[i]!.cumulative_distribution,
            pdf: state.computedDices[i]!.distribution,
          }
    );

    return [segmentStates, numDicesCalculated];
  });
  const dispatch = useDispatch();
  return (
    <div>
      {segmentStates.map((e) => (
        <DiceInputSegment
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
