import { useState, useTransition } from "react";
import { useDispatch } from "react-redux";
import { ALL_DICE_INDICES, DiceIndex } from "../../logic/data_types";
import { Actions } from "../../logic/redux/actions";
import { getPartialInitSettingsFromURLParams } from "../../logic/utils";
import ExamplesSidebarEntry from "./ExamplesSidebarEntry";
import { Icons } from "./ui";

let examples: {
  items: Partial<Record<DiceIndex, string>>;
  subtitle: string;
}[] = [
  {
    items: { 0: "2d6" },
    subtitle: "Rolling two usual dice",
  },

  {
    items: { 1: "d10 - d10" },
    subtitle: "The difference between 2 ten-sided dice",
  },

  {
    items: { 2: "max(d6,d6,d6)" },
    subtitle: "The maximum of 3 dice",
  },

  {
    items: { 0: "max(min(d6,d6),d6)", 1: "min(max(d6,d6),d6)" },
    subtitle:
      "Comparing how the order of minimum and maximum changes the distribution",
  },
  {
    items: { 2: "10d20" },
    subtitle: "Approximation of normal distribution",
  },
  {
    items: { 1: "d10/d5" /*2: "max(d20,d20)/d6"*/ },
    subtitle: "Division of dice. Values always rounded to next integer.",
  },

  {
    items: { 0: "d2xd6", 1: "d6xd2", 2: "d4xd3" },
    subtitle:
      "Rolling dice a number of times depending on the outcome of other dice",
  },
  {
    items: { 0: "2d2*d3*10+(d10-d10)" },
    subtitle: "A very funny distribution.",
  },
  {
    items: { 1: "d2*12+4d6", 2: "8d3+16" },
    subtitle:
      "A bimodal distribution and a unimodal distribution with the same mean",
  },
  {
    items: { 0: "10x(max(min(12,\nd20),9))" },
    subtitle: "Spiky distribution, looks like a hedgehog",
  },
  {
    items: { 1: "10x(max(min(56,\nd100),45))+d5" },
    subtitle: "Jedi Temple",
  },
  {
    items: { 2: "abs(2d20-2d20)" },
    subtitle: "Using the absolute value of a distribution.",
  },
  {
    items: { 0: "d30xd30" },
    subtitle:
      "About the limit of computations. This takes about 30 seconds to compute.",
  },
];

const ExamplesSideBar = () => {
  let [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  return (
    <div
      className="output-shadow bg-slate-800 
    rounded-tr-2xl rounded-br-2xl 
    thick-shadow mr-5"
    >
      <div
        className={`pl-3 p-3 pr-5 rounded-tr-2xl 
        cursor-pointer md:cursor-default flex 
        justify-between items-center ${!open ? "rounded-br-2xl" : ""}`}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <h2 className="text-2xl leading-none font-bold text-white">Examples</h2>
        <div className="self-right md:hidden">
          <svg
            height="20px"
            width="20px"
            xmlns="http://www.w3.org/2000/svg"
            viewBox={Icons.arrow.viewBox}
            style={{
              transition: "all 170ms ease-in-out",
              transform: open ? "rotate(0deg)" : "rotate(180deg)",
            }}
          >
            <path className={"fill-white"} d={Icons.arrow.d} />
          </svg>
        </div>
      </div>

      <div
        className={`pl-3 pr-5 max-h-full sidebar`}
        style={{
          maxHeight: open ? "3000px" : "0px",
        }}
      >
        {examples.map((e, i) => (
          <ExamplesSidebarEntry
            key={i}
            subtitle={e.subtitle}
            items={e.items}
            onClick={() => {
              let hrefElements = [`?`];
              ALL_DICE_INDICES.forEach((i) => {
                if (e.items[i]) {
                  hrefElements.push(
                    `d${i + 1}=${encodeURIComponent(e.items[i]!)}`
                  );
                  hrefElements.push(`&`);
                }
              });
              hrefElements.pop();
              const href = hrefElements.join("");

              window.history.pushState(href, "another page", href);

              setOpen(false);
              dispatch(
                Actions.reset({
                  ...e.items,
                })
              );
            }}
          />
        ))}
        <div className="mt-5"></div>
      </div>
    </div>
  );
};

export default ExamplesSideBar;
