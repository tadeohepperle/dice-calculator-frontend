import { useDispatch, useSelector } from "react-redux";
import { ALL_DICE_INDICES, DiceIndex } from "../../logic/data_types";
import type { AppState } from "../../logic/redux/state";

export interface Props {}

const DiceStatsDisplay = (props: Props) => {
  const computedDices = useSelector((state: AppState) => {
    return state.computedDices;
  });
  const dispatch = useDispatch();

  return <div>Stats</div>;
};

export default DiceStatsDisplay;

// Dice Nr.{i + 1}
// Mean: {computedDices[i as DiceIndex]?.mean}
