import { useState } from "react";

const Example = () => {
  const [state, setState] = useState(0);
  return (
    <div>
      This is a counter:
      <button
        className="bg-slate-900 rounded m-3 p-3 shadow-md text-white"
        onClick={() => {
          setState(state + 1);
        }}
      >
        Click me
      </button>
      <div className="p-4 bg-red-300">{state}</div>
    </div>
  );
};

export default Example;
