import { DiceIndex } from "../../logic/data_types";
import ExamplesSidebarEntry from "./ExamplesSidebarEntry";

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
    items: { 0: "10x(max(min(12,d20),9))" },
    subtitle: "Spiky distribution, looks like a hedgehog",
  },
  {
    items: { 1: "10x(max(min(56,d100),45))+d5" },
    subtitle: "Jedi Temple",
  },
  {
    items: { 2: "d30xd30" },
    subtitle:
      "About the limit of computations. This takes about 30 seconds to compute.",
  },
  // {
  //     items: ["___"],
  //  subtitle: "____"
  // },
];

const ExamplesSideBar = () => {
  return (
    <div className="output-shadow rounded-tr-2xl rounded-br-2xl p-3 pb-5 pr-5 thick-shadow mr-5">
      <h2 className="text-2xl leading-none font-bold text-white">Examples</h2>
      <div className="hidden md:block">
        {examples.map((e, i) => (
          <ExamplesSidebarEntry key={i} subtitle={e.subtitle} items={e.items} />
        ))}
      </div>
    </div>
  );
};

export default ExamplesSideBar;
