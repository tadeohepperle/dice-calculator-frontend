import { Icons } from "./ui";

interface Props {
  onChange: () => void;
}

const CloseButton = (props: Props) => {
  const icon = Icons.trash;
  return (
    <button
      className="bg-slate-300 rounded p-1 border-none surface-inner-shadow-and-thick
        font-bold text-lg
       hover:bg-slate-100
       transition-all flex items-center
       group
       "
    >
      <svg
        height="14px"
        width="14px"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={icon.viewBox}
      >
        <path
          className={
            icon.pathClassName ?? "fill-red-500 group-hover:fill-red-300"
          }
          d={icon.d}
        />
      </svg>
    </button>
  );
};

export default CloseButton;
