import { faCalculator } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UIColor, UIIcon } from "./ui";

interface Props {
  title: string;
  uiColor: UIColor;
  icon: UIIcon;
  onClick: (() => void) | null;
  onChangeNumber: (value: number) => void;
  number: number;
  className?: string;
  grow: "none" | "normal" | "dominant";
}

const IconButtonWithNumber = (props: Props) => {
  const { icon, uiColor, onChangeNumber, onClick } = props;
  const active = !!onClick;

  return (
    <button
      onClick={active ? onClick : () => {}}
      className={`
      ${!active ? " bg-gray-400 cursor-default" : ""}
      ${
        active && uiColor == UIColor.Primary
          ? " hover:bg-sky-100 bg-sky-200"
          : ""
      }
      ${
        active && uiColor == UIColor.Secondary
          ? " hover:bg-rose-100 bg-rose-200"
          : ""
      }
      ${
        active && uiColor == UIColor.Tertiary
          ? " hover:bg-orange-100 bg-orange-200"
          : ""
      }
      ${
        active && uiColor == UIColor.Ghost
          ? " hover:bg-slate-600 bg-slate-700"
          : ""
      }
      px-3 py-1 
      rounded-lg border-none surface-inner-shadow-and-thick
       text-slate-900 font-bold text-lg
       transition-all flex items-center justify-center
       ${active ? "hover:translate-y-1" : ""}
       ${props.grow == "normal" ? "flex-grow xs:flex-grow-0" : ""}
       ${props.grow == "dominant" ? "flex-grow" : ""}
       ${props.className}`}
    >
      <svg
        height="20px"
        width="20px"
        className="mr-2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={icon.viewBox}
      >
        <path className={icon.pathClassName ?? "fill-slate-900"} d={icon.d} />
      </svg>

      {props.title}
      <input
        onChange={(e) => {
          try {
            let n: number = parseInt(e.target.value);
            onChangeNumber(n);
          } catch (ex) {
            console.log(ex); // should never happen
          }
        }}
        type="number"
        className="
        ml-2 text-sm
        input-shadow
        appearance-none 
        leading-tight
        bg-slate-900 font-bold
        transition-all
         text-white rounded-lg block w-16 pr-1 pl-3 py-1 ring-0"
        inputMode="numeric"
        value={props.number}
      />
    </button>
  );
};

export default IconButtonWithNumber;
