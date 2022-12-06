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
import {
  ALL_DICE_INDICES,
  RollPayload,
  RollResult,
} from "../../logic/data_types";
import { useState } from "react";
import RollOutput from "./RollOutput";
import { wait } from "../../logic/utils";
import { wasmRoll } from "../../logic/webworker/webworker_interface";

interface Props {
  diceIndex: 0 | 1 | 2;
  calculationState: CalculationState;
  initialInput?: string;
}

const DiceInputSegment = (props: Props) => {
  const { diceIndex, calculationState } = props;

  const [rollManyNumber, setRollManyNumber] = useState<number>(100);
  const [inputValue, setInputValue] = useState(props.initialInput || "");
  const [inputChanged, setInputChanged] = useState(false);
  const [lastInitialInput, setLastInitialInput] = useState(
    props.initialInput || ""
  );
  const [rollResult, setRollResult] = useState<RollResult | undefined>(
    undefined
  );
  const [animationState, setAnimationState] = useState<{ running: boolean }>({
    running: false,
  });

  const { inputSegmentCount, initialInput } = useSelector((state: AppState) => {
    let inputSegmentCount = numberOfInputSegments(state);
    let initialInput = state.inputSegments[diceIndex]?.initialInput;
    return { inputSegmentCount, initialInput };
  });
  if (initialInput !== undefined && initialInput != lastInitialInput) {
    setLastInitialInput(initialInput);
    setInputValue(initialInput);
  }
  const dispatch = useDispatch();

  const roll = async (type: "one" | "many") => {
    if (animationState.running) return;
    setAnimationState({ running: true });
    let payloadMode: RollPayload["mode"] = (() => {
      switch (type) {
        case "one":
          return { type: "one" };
        case "many":
          return { type: "many", amount: rollManyNumber };
      }
    })();
    try {
      let result = await wasmRoll({ diceIndex, mode: payloadMode });
      setRollResult(result);
    } catch (ex) {
      console.error(ex);
    }

    // dispatch(Actions.rollOne(diceIndex));
    await wait(200);
    setAnimationState({ running: false });
    // {
    //   type: "many",
    //   numbers: [
    //     1, 2, 4, 23, 7, 47, 33, 1, 2, 4, 23, 7, 47, 33, 1, 2, 4, 23, 7,
    //     47, 33, 1, 2, 4, 23, 7, 47, 33, 1, 2, 4, 23, 7, 47, 33, 1, 2, 4,
    //     23, 7, 47, 33, 1, 2, 4, 23, 7, 47, 33,
    //   ],
    // }
  };

  let color: UIColor = diceIndexToUiColor(props.diceIndex);
  return (
    <div className="mt-5 pb-2.5 relative">
      <div className="flex">
        <div className="flex-grow">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputChanged && inputValue.length > 0) {
                setInputChanged(false);
                dispatch(Actions.calculateDistribution(diceIndex, inputValue));
              }
            }}
          >
            <InputField
              placeholder="2d6"
              value={inputValue}
              onChange={(value) => {
                setInputValue(value);
                setInputChanged(true);
                setRollResult(undefined);
              }}
            ></InputField>
          </form>
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
            inputChanged && inputValue.length > 0
              ? () => {
                  setInputChanged(false);
                  dispatch(
                    Actions.calculateDistribution(diceIndex, inputValue)
                  );
                }
              : null
          }
          loading={calculationState.type == "calculating"}
          icon={Icons.calculator}
          grow="dominant"
        ></IconButton>
        <div className="basis-full xs:basis-auto xs:mr-5"></div>
        <div>
          <IconButton
            className={"mt-5"}
            uiColor={color}
            title="Roll"
            onClick={
              !inputChanged && calculationState.type == "done"
                ? () => roll("one")
                : null
            }
            icon={Icons.d20}
            grow="normal"
          ></IconButton>
          {/* <div className="w-full b text-xl text-white bg-slate-900 thick-shadow">
            20
          </div> */}
        </div>

        <div className="mr-5"></div>
        <IconButtonWithNumber
          className={"mt-5"}
          number={rollManyNumber}
          uiColor={color}
          title="Roll"
          onChangeNumber={(n) => {
            setRollManyNumber(n);
          }}
          onClick={
            !inputChanged && calculationState.type == "done"
              ? () => roll("many")
              : null
          }
          icon={Icons.d20}
          grow="normal"
        ></IconButtonWithNumber>
      </div>
      {!inputChanged && rollResult !== undefined && (
        <div
          className={`mt-7 flex justify-center ${
            animationState.running ? "roll-animation" : ""
          }`}
        >
          <RollOutput uiColor={color} rollResult={rollResult}></RollOutput>
        </div>
      )}
    </div>
  );
};

export default DiceInputSegment;
