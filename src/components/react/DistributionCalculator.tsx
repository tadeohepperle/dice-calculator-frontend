import { Provider, useDispatch, useSelector } from "react-redux";
import { hello } from "../../functions";
import DiceInputSegment from "./DiceInputSegment";
import IconButton from "./IconButton";
import InputField from "./InputField";
import { Actions, AppState, CalculationState, DiceIndex } from "./store";

import { UIColor, Icons } from "./ui";

const DistributionCalculator = () => {
  const segmentStates: {
    diceIndex: DiceIndex;
    calculationState: CalculationState;
  }[] = useSelector((state: AppState) => {
    return state.inputSegments.map((e) => {
      return { diceIndex: e.diceIndex, calculationState: e.calculationState };
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
            dispatch(Actions.addDice({}));
          }}
          grow="none"
        ></IconButton>
      )}
    </div>
  );
};

export default DistributionCalculator;
