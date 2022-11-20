import { Provider, useDispatch, useSelector } from "react-redux";
import DiceInputSegment from "./DiceInputSegment";
import IconButton from "./IconButton";
import InputField from "./InputField";
import { Actions, AppState } from "./store";

import { UIColor, Icons } from "./ui";

const DistributionCalculator = () => {
  const diceIndexes = useSelector((state: AppState) => {
    return state.inputSegments.map((e) => e.diceIndex);
  });
  const dispatch = useDispatch();
  return (
    <div>
      {diceIndexes.map((i) => (
        <DiceInputSegment key={i} diceIndex={i}></DiceInputSegment>
      ))}

      {diceIndexes.length < 3 && (
        <IconButton
          className={"mt-5"}
          uiColor={UIColor.Ghost}
          title="Add dice to compare"
          icon={Icons.add}
          onClick={() => {
            dispatch(Actions.addDice({}));
          }}
        ></IconButton>
      )}
    </div>
  );
};

export default DistributionCalculator;
