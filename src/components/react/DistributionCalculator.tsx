import { Provider, useDispatch, useSelector } from "react-redux";
import {
  ALL_DICE_INDICES,
  DiceIndex,
  Distributions,
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

const DistributionCalculator = () => {
  const [segmentStates, atLeastOneDiceCalculated, distributions]: [
    {
      diceIndex: DiceIndex;
      calculationState: CalculationState;
    }[],
    boolean,
    Distributions
  ] = useSelector((state: AppState) => {
    const segmentStates: {
      diceIndex: DiceIndex;
      calculationState: CalculationState;
    }[] = state.segmentDisplayOrder.map((i) => {
      const { diceIndex, calculationState } = state.inputSegments[i]!;
      return { diceIndex, calculationState };
    });

    const atLeastOneDiceCalculated = ALL_DICE_INDICES.some(
      (i) => state.computedDices[i]
    );

    const distributionsArr = ALL_DICE_INDICES.map((i) =>
      state.computedDices[i] === undefined
        ? undefined
        : {
            cdf: state.computedDices[i]!.cumulative_distribution,
            pdf: state.computedDices[i]!.distribution,
          }
    );
    const distributions = {
      0: distributionsArr[0],
      1: distributionsArr[1],
      2: distributionsArr[2],
    };

    return [segmentStates, atLeastOneDiceCalculated, distributions];
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
      {atLeastOneDiceCalculated && (
        <div>
          <DiceChartDisplay distributions={distributions}></DiceChartDisplay>
          <DiceStatsDisplay></DiceStatsDisplay>
        </div>
      )}
    </div>
  );
};

export default DistributionCalculator;
