export interface Props {
  data: [string, string][];
  value: string;
  onChange: (value: string) => void;
}

export const SmallSelect = (props: Props) => {
  return (
    <select
      className="ml-2 h-6 ring-0 px-1 pb-1 pt-0 input-shadow leading-tight bg-slate-900 font-bold transition-all  text-white rounded-lg"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
    >
      {props.data.map(([v, t]) => (
        <option value={v} key={v}>
          {t}
        </option>
      ))}
    </select>
  );
};

export default SmallSelect;
