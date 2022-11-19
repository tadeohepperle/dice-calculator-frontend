import { Provider } from "react-redux";
import DiceInputSegment from "./DiceInputSegment";
import IconButton from "./IconButton";
import InputField from "./InputField";
import { store } from "./store";
import { UIColor, Icons } from "./ui";

const DistributionCalculator = () => {
  return (
    <Provider store={store}>
      <div>
        <DiceInputSegment diceIndex={1}></DiceInputSegment>
        <DiceInputSegment diceIndex={2}></DiceInputSegment>
        <IconButton
          className={"mt-5"}
          uiColor={UIColor.Ghost}
          title="Add dice to compare"
          icon={Icons.add}
          onClick={() => {}}
        ></IconButton>
      </div>
    </Provider>
  );
};

export default DistributionCalculator;
