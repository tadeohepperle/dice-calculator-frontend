import { RollResult } from "../../logic/data_types";
import { textColors, UIColor } from "./ui";

export interface Props {
  uiColor: UIColor;
  rollResult: RollResult;
}

const RollOutput = (props: Props) => {
  const { uiColor, rollResult } = props;
  return (
    <div
      className={`
    ${textColors[uiColor]}
      bg-slate-700 p-3 min-w-40 px-6 
        text-center  font-bold 
      output-shadow rounded-3xl
      border-1 border-white`}
    >
      {rollResult.type === "one" && (
        <span className="text-4xl">{rollResult.number}</span>
      )}

      {rollResult.type === "many" && (
        <span className="text-xl">{rollResult.numbers.join(", ")}</span>
      )}
    </div>
  );
};

export default RollOutput;
