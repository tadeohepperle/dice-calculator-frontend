import IconButton from "./IconButton";
import IconButtonWithNumber from "./IconButtonWithNumber";
import InputField from "./InputField";
import { Icons, UIColor, diceIndexToUiColor } from "./ui";

import { Actions, AppState } from "./store";
import { useDispatch, useSelector } from "react-redux";

interface Props {
  diceIndex: 0 | 1 | 2;
}

const DiceInputSegment = (props: Props) => {
  const con: number = useSelector((state: AppState) => {
    return state.counter;
  });
  const dispatch = useDispatch();

  let color: UIColor = diceIndexToUiColor(props.diceIndex);
  return (
    <div className="mt-5 pb-2.5">
      <div className="p-5 bg-green-500">
        {con}
        <br></br>
        <button
          onClick={() => {
            console.log("inc");
            dispatch(Actions.addDice({}));
          }}
        >
          Increment
        </button>
      </div>
      <div className="flex">
        <div className="flex-grow">
          <InputField placeholder="2d6" onChange={() => {}}></InputField>
        </div>
        <div></div>
      </div>
      <div className="flex flex-wrap">
        <IconButton
          className={"mt-5"}
          uiColor={color}
          title="Calculate Distribution"
          onClick={() => {}}
          icon={Icons.calculator}
          grow={true}
        ></IconButton>
        <div className="basis-full xs:basis-auto xs:mr-5"></div>
        <IconButton
          className={"mt-5"}
          uiColor={color}
          title="Roll"
          onClick={() => {}}
          icon={Icons.d20}
        ></IconButton>
        <div className="mr-5"></div>
        <IconButtonWithNumber
          className={"mt-5"}
          number={100}
          uiColor={color}
          title="Roll"
          onClick={() => {}}
          icon={Icons.d20}
        ></IconButtonWithNumber>
      </div>
    </div>
  );
};

export default DiceInputSegment;
