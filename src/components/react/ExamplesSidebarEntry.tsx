import { ALL_DICE_INDICES, DiceIndex } from "../../logic/data_types";
import { bgColors, diceIndexToUiColor, textColors } from "./ui";

export interface Props {
  items: Partial<Record<DiceIndex, string>>;
  subtitle: string;
  onClick: () => any;
}

const ExamplesSidebarEntry = (props: Props) => {
  const { items, subtitle } = props;
  const firstDiceIndex = ALL_DICE_INDICES.find((i) => items[i]) as DiceIndex;
  // construct href

  // render
  return (
    <div className="group">
      <div
        className="flex mt-5 cursor-pointer transition-all hover:translate-x-2"
        onClick={props.onClick}
      >
        <div
          className={`w-1 mr-2 ${bgColors[diceIndexToUiColor(firstDiceIndex)]}`}
          // {
          //   [
          //     "w-1 mr-2 bg-sky-200",
          //     "w-1 mr-2 bg-gradient-to-b from-sky-200  to-rose-200",
          //     "w-1 mr-2 bg-gradient-to-b from-sky-200  via-rose-200 to-orange-200",
          //   ][sidelineclassNameIndex]
          // }
        ></div>
        <div className="w-full">
          {ALL_DICE_INDICES.map(
            (i) =>
              items[i] && (
                <div
                  key={i}
                  className={`${
                    textColors[diceIndexToUiColor(i)]
                  } font-bold text-xl`}
                >
                  {items[i]}
                </div>
              )
          )}
          <div className="text-slate-400 w-48 text-sm group-hover:text-white">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamplesSidebarEntry;
