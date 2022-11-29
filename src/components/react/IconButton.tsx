import { faCalculator } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UIColor, UIIcon } from "./ui";
import LoadingSpinner from "./utility/LoadingSpinner";

interface Props {
  title: string;
  uiColor: UIColor;
  icon: UIIcon;
  grow: "none" | "normal" | "dominant";
  className?: string;
  onClick: (() => void) | null;
  loading?: boolean;
}

const IconButton = (props: Props) => {
  const { icon, uiColor, onClick, loading } = props;
  const active = !!onClick;

  return (
    <button
      onClick={active ? onClick : () => {}}
      className={`
      ${!active ? " bg-gray-400 cursor-not-allowed" : ""}
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
      px-3 py-1.5 
      rounded-lg border-none surface-inner-shadow-and-thick
       text-slate-900 font-bold text-lg
       transition-all flex items-center justify-center
       ${active ? "hover:translate-y-1" : ""}
       ${props.grow == "normal" ? "flex-grow xs:flex-grow-0" : ""}
       ${props.grow == "dominant" ? "flex-grow" : ""}
       ${props.className}`}
    >
      {loading && (
        <LoadingSpinner className="mr-2 text-slate-900 fill-gray-300"></LoadingSpinner>
      )}
      {!loading && (
        <svg
          height="20px"
          width="20px"
          className={props.title ? "mr-2" : ""}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={icon.viewBox}
        >
          <path className={icon.pathClassName ?? "fill-slate-900"} d={icon.d} />
        </svg>
      )}

      {props.title}
    </button>
  );
};

export default IconButton;
