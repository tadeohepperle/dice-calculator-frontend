import { Provider, useDispatch, useSelector } from "react-redux";
import type { DiceIndex } from "../../logic/data_types";
import { Actions } from "../../logic/redux/actions";
import type { AppState, CalculationState } from "../../logic/redux/state";
import DiceInputSegment from "./DiceInputSegment";
import IconButton from "./IconButton";
import InputField from "./InputField";

import { UIColor, Icons } from "./ui";

const DistributionCalculator = () => {
  const segmentStates: {
    diceIndex: DiceIndex;
    calculationState: CalculationState;
  }[] = useSelector((state: AppState) => {
    return [0, 1, 2]
      .map((i) => state.inputSegments[i as DiceIndex])
      .filter((e) => e !== undefined)
      .map((e) => {
        const { diceIndex, calculationState } = e!;
        return { diceIndex, calculationState };
      });
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
    </div>
  );
};

export default DistributionCalculator;
