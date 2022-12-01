import ExamplesSidebarEntry from "./ExamplesSidebarEntry";

let examples: {
  items: [string] | [string, string] | [string, string, string];
  subtitle: string;
}[] = [
  {
    items: ["2d6"],
    subtitle: "Rolling two usual dice",
  },

  {
    items: ["d10 - d10"],
    subtitle: "The difference between 2 ten-sided dice",
  },

  {
    items: ["max(d6,d6,d6)"],
    subtitle: "The maximum of 3 dice",
  },

  {
    items: ["max(min(d6,d6),d6)", "min(max(d6,d6),d6)"],
    subtitle:
      "Comparing how the order of minimum and maximum changes the distribution",
  },

  {
    items: ["d2(d6)", "d6(d2)", "d4(d3)"],
    subtitle:
      "Rolling dice a number of times depending on the outcome of other dice",
  },

  // {
  //     items: ["___"],
  //  subtitle: "____"
  // },
];

const ExamplesSideBar = () => {
  return (
    <div className="bg-slate-900 rounded-tr-lg rounded-br-lg p-3 pb-5 thick-shadow mr-5">
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
