import { JsDice } from "./pkg/dices_bg.wasm";
let d = JsDice.build_from_string("2d30");
console.info(`dice was built in ${d.build_time}ms`);
export function addone(num) {
  return num + 1;
}
