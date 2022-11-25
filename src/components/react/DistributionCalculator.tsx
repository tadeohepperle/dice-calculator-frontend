import { Provider, useDispatch, useSelector } from "react-redux";
import { ALL_DICE_INDICES, DiceIndex } from "../../logic/data_types";
import { Actions } from "../../logic/redux/actions";
import type { AppState, CalculationState } from "../../logic/redux/state";
import DiceInputSegment from "./DiceInputSegment";
import DicePlotDisplay from "./DicePlotDisplay";
import DicePlot from "./DicePlotDisplay";
import DiceStatsDisplay from "./DiceStatsDisplay";
import IconButton from "./IconButton";
import InputField from "./InputField";

import { UIColor, Icons } from "./ui";

const DistributionCalculator = () => {
  const [segmentStates, atLeastOneDiceCalculated]: [
    {
      diceIndex: DiceIndex;
      calculationState: CalculationState;
    }[],
    boolean
  ] = useSelector((state: AppState) => {
    const segmentStates: {
      diceIndex: DiceIndex;
      calculationState: CalculationState;
    }[] = ALL_DICE_INDICES.map((i) => state.inputSegments[i])
      .filter((e) => e !== undefined)
      .map((e) => {
        const { diceIndex, calculationState } = e!;
        return { diceIndex, calculationState };
      });
    const atLeastOneDiceCalculated = ALL_DICE_INDICES.some(
      (i) => state.computedDices[i]
    );
    return [segmentStates, atLeastOneDiceCalculated];
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
          <DicePlotDisplay></DicePlotDisplay>
          <DiceStatsDisplay></DiceStatsDisplay>
        </div>
      )}
    </div>
  );
};

export default DistributionCalculator;
