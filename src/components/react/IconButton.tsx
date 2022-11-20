import { faCalculator } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UIColor, UIIcon } from "./ui";

interface Props {
  title: string;
  uiColor: UIColor;
  icon: UIIcon;
  grow: "none" | "normal" | "dominant";
  className?: string;
  onClick: () => void;
}

const IconButton = (props: Props) => {
  const { icon, uiColor } = props;

  return (
    <button
      onClick={props.onClick}
      className={`
      ${uiColor == UIColor.Primary ? " hover:bg-sky-100 bg-sky-200" : ""}
      ${uiColor == UIColor.Secondary ? " hover:bg-rose-100 bg-rose-200" : ""}
      ${uiColor == UIColor.Tertiary ? " hover:bg-orange-100 bg-orange-200" : ""}
      ${uiColor == UIColor.Ghost ? " hover:bg-slate-600 bg-slate-700" : ""}
      px-3 py-1.5 
      rounded-lg border-none surface-inner-shadow-and-thick
       text-slate-900 font-bold text-lg
       transition-all flex items-center
       hover:translate-y-1
       
       ${props.grow == "normal" ? "flex-grow xs:flex-grow-0" : ""}
       ${props.grow == "dominant" ? "flex-grow" : ""}
       justify-center
       ${props.className}
       
       `}
    >
      <svg
        height="20px"
        width="20px"
        className={props.title ? "mr-2" : ""}
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
