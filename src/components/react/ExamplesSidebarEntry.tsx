import { ALL_DICE_INDICES } from "../../logic/data_types";

export interface Props {
  items: [string] | [string, string] | [string, string, string];
  subtitle: string;
}

const ExamplesSidebarEntry = (props: Props) => {
  const { items, subtitle } = props;
  let sidelineclassNameIndex = items.length - 1;
  let hrefElements = [`?`];
  ALL_DICE_INDICES.forEach((i) => {
    if (items[i]) {
      hrefElements.push(`d${i + 1}=${encodeURIComponent(items[i]!)}`);
      hrefElements.push(`&`);
    }
  });
  hrefElements.pop();
  console.log(hrefElements);
  const href = hrefElements.join("");
  return (
    <a href={href} className="group">
      <div className="flex mt-5 cursor-pointer transition-all hover:translate-x-2">
        <div
          className={
            [
              "w-1 mr-2 bg-sky-200",
              "w-1 mr-2 bg-gradient-to-b from-sky-200  to-rose-200",
              "w-1 mr-2 bg-gradient-to-b from-sky-200  via-rose-200 to-orange-200",
            ][sidelineclassNameIndex]
          }
        ></div>
        <div className="w-full">
          <div className="text-sky-200 font-bold text-xl">{items[0]}</div>
          {items.length >= 2 && (
            <div className="text-rose-200 font-bold text-xl">{items[1]}</div>
          )}
          {items.length >= 3 && (
            <div className="text-orange-200 font-bold text-xl">{items[2]}</div>
          )}
          <div className="text-slate-400 w-48 text-sm group-hover:text-white">
            {subtitle}
          </div>
        </div>
      </div>
    </a>
  );
};

export default ExamplesSidebarEntry;
