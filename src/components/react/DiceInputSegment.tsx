import IconButton from "./IconButton";
import IconButtonWithNumber from "./IconButtonWithNumber";
import InputField from "./InputField";
import { Icons, UIColor, diceIndexToUiColor } from "./ui";

import { useDispatch, useSelector } from "react-redux";
import CloseButton from "./CloseButton";
import type { AppState, CalculationState } from "../../logic/redux/state";
import { Actions } from "../../logic/redux/actions";

interface Props {
  diceIndex: 0 | 1 | 2;
  calculationState: CalculationState;
}

const DiceInputSegment = (props: Props) => {
  const { diceIndex, calculationState } = props;
  const { inputValue, rollManyNumber } = useSelector((state: AppState) => {
    let segment = state.inputSegments[diceIndex];
    return segment;
  });
  const dispatch = useDispatch();

  let color: UIColor = diceIndexToUiColor(props.diceIndex);
  return (
    <div className="mt-5 pb-2.5 relative">
      {/* {true && (
        <div className="absolute -right-1 -top-1">
          <CloseButton onChange={() => {}}></CloseButton>
        </div>
      )} */}

      <div className="flex">
        <div className="flex-grow">
          <InputField
            placeholder="2d6"
            value={inputValue}
            onChange={(value) => {
              dispatch(Actions.changeInput(diceIndex, value));
            }}
          ></InputField>
        </div>
        {diceIndex != 0 && (
          <IconButton
            className="ml-4"
            uiColor={color}
            title=""
            onClick={() => {
              dispatch(Actions.deleteDice(diceIndex));
            }}
            icon={Icons.trash}
            grow="none"
          ></IconButton>
        )}
      </div>
      <div className="flex flex-wrap">
        <IconButton
          className={"mt-5"}
          uiColor={color}
          title="Calculate Distribution"
          onClick={
            calculationState == "newinput"
              ? () => {
                  dispatch(Actions.calculateDistribution(diceIndex));
                }
              : null
          }
          icon={Icons.calculator}
          grow="dominant"
        ></IconButton>
        <div className="basis-full xs:basis-auto xs:mr-5"></div>
        <IconButton
          className={"mt-5"}
          uiColor={color}
          title="Roll"
          onClick={
            calculationState == "done"
              ? () => {
                  dispatch(Actions.rollOne(diceIndex));
                }
              : null
          }
          icon={Icons.d20}
          grow="normal"
        ></IconButton>
        <div className="mr-5"></div>
        <IconButtonWithNumber
          className={"mt-5"}
          number={rollManyNumber}
          uiColor={color}
          title="Roll"
          onChangeNumber={(n) => {
            dispatch(Actions.changeRollManyNumber(diceIndex, n));
          }}
          onClick={
            calculationState == "done"
              ? () => {
                  dispatch(Actions.rollMany(diceIndex, rollManyNumber));
                }
              : null
          }
          icon={Icons.d20}
          grow="normal"
        ></IconButtonWithNumber>
      </div>
    </div>
  );
};

export default DiceInputSegment;
