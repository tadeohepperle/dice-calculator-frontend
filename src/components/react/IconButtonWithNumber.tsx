import { faCalculator } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { UIColor, UIIcon } from "./ui";

interface Props {
  title: string;
  uiColor: UIColor;
  icon: UIIcon;
  onClick: () => void;
  number: number;
}

const IconButtonWithNumber = (props: Props) => {
  const { icon } = props;
  return (
    <button
      onClick={props.onClick}
      className="hover:bg-rose-300 bg-rose-200 px-3 py-1.5 
      rounded-lg border-none surface-inner-shadow-and-thick
       text-slate-900 font-bold text-lg
       transition-all flex items-center
       hover:translate-y-1

       flex-grow
       justify-center
       "
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
          // TODO;
        }}
        type="number"
        id="first_name"
        className="
        ml-2
        input-shadow
        appearance-none 
        leading-tight
        bg-slate-900 font-bold
        transition-all
         text-white rounded-lg block w-20 pr-1 pl-3 py-1 ring-0"
        inputMode="numeric"
        value={props.number}
      />
    </button>
  );
};

export default IconButtonWithNumber;
