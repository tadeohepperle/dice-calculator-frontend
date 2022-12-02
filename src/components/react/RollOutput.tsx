import { UIColor } from "./ui";

export interface Props {
  uiColor: UIColor;
}

const textColors: Record<UIColor, string> = {
  [UIColor.Primary]: "text-sky-200 ",
  [UIColor.Secondary]: "text-rose-200 ",
  [UIColor.Tertiary]: "text-orange-200 ",
  [UIColor.Ghost]: "text-slate-900",
};

const RollOutput = (props: Props) => {
  const { uiColor } = props;
  return (
    <div
      className={`
    ${textColors[uiColor]}
      mt-4 bg-slate-700 p-3 w-40 
        text-center text-4xl font-bold 
      output-shadow rounded-3xl
      border-1 border-white`}
    >
      7
    </div>
  );
};

export default RollOutput;
