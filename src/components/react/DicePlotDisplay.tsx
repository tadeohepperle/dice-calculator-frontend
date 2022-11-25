import { useSelector } from "react-redux";
import { ALL_DICE_INDICES, DiceIndex } from "../../logic/data_types";
import type { AppState } from "../../logic/redux/state";

export interface Props {}

const DicePlotDisplay = (props: Props) => {
  const computedDices = useSelector((state: AppState) => {
    return state.computedDices;
  });

  return (
    <div>
      {ALL_DICE_INDICES.map((i) => (
        <div key={i}>
          Dice Nr.{i + 1} <br></br>
          {computedDices[i]?.mean.float}
        </div>
      ))}
    </div>
  );
};

export default DicePlotDisplay;

// Dice Nr.{i + 1}
// Mean: {computedDices[i as DiceIndex]?.mean}
