import type { ChangeEventHandler } from "react";

interface Props {
  onChange: (val: string) => void;
  placeholder: string;
}

const InputField = (props: Props) => {
  return (
    <div>
      <input
        onChange={(e) => props.onChange(e.target.value)}
        type="text"
        id="first_name"
        className="
        input-shadow
        appearance-none 
        leading-tight
        bg-slate-900 font-bold
        transition-all
         text-white text-lg rounded-lg block w-full px-3 py-2 ring-0"
        placeholder={props.placeholder}
      />
    </div>
  );
};

export default InputField;
