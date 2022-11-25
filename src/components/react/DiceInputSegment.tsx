import IconButton from "./IconButton";
import IconButtonWithNumber from "./IconButtonWithNumber";
import InputField from "./InputField";
import { Icons, UIColor, diceIndexToUiColor } from "./ui";

import { useDispatch, useSelector } from "react-redux";
import CloseButton from "./CloseButton";
import {
  AppState,
  CalculationState,
  numberOfInputSegments,
} from "../../logic/redux/state";
import { Actions } from "../../logic/redux/actions";
import { ALL_DICE_INDICES } from "../../logic/data_types";

interface Props {
  diceIndex: 0 | 1 | 2;
  calculationState: CalculationState;
}

const DiceInputSegment = (props: Props) => {
  const { diceIndex, calculationState } = props;
  const {
    segment: { inputValue, rollManyNumber },
    inputSegmentCount,
  } = useSelector((state: AppState) => {
    let segment = state.inputSegments[diceIndex]!;
    let inputSegmentCount = numberOfInputSegments(state);

    return { segment, inputSegmentCount };
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
        {inputSegmentCount >= 2 && (
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
      {calculationState.type == "error" && calculationState.message && (
        <div className="mt-3 ml-2">
          <span className="text-red-500">{calculationState.message}</span>
        </div>
      )}
      <div className="flex flex-wrap">
        <IconButton
          className={"mt-5"}
          uiColor={color}
          title="Calculate Distribution"
          onClick={
            calculationState.type == "newinput"
              ? () => {
                  dispatch(Actions.calculateDistribution(diceIndex));
                }
              : null
          }
          loading={calculationState.type == "calculating"}
          icon={Icons.calculator}
          grow="dominant"
        ></IconButton>
        <div className="basis-full xs:basis-auto xs:mr-5"></div>
        <IconButton
          className={"mt-5"}
          uiColor={color}
          title="Roll"
          onClick={
            calculationState.type == "done"
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
            calculationState.type == "done"
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
