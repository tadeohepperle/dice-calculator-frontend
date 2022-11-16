import { faCalculator } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { UIColor, UIIcon } from "./ui";

interface Props {
  title: string;
  uiColor: UIColor;
  icon: UIIcon;
  onClick: () => void;
}

const IconButton = (props: Props) => {
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
    </button>
  );
};

export default IconButton;
