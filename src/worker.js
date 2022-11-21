import { greet, JsDice } from "dices";

async function main() {
  console.info(`sratcalc`);
  let g = greet();
  console.warn(g);
  let d = JsDice.build_from_string("2d60");
  console.log(`built in  ${d.build_time}`);
}

main();
