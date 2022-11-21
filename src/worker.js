import { greet } from "dices";

async function main() {
  const path_to_wasm = "http://127.0.0.1:3000/js/pkg/dices_bg.wasm";
  console.info(`going to init wasm`);
  console.log(greet());

  // await init(path_to_wasm);

  // console.info(`end init wasm`);
  // self.onmessage = function (msg) {
  //   console.log(`got message ${msg}`);
  //   let s = greet();
  //   console.log(`calc donw ${s}`);
  //   self.postMessage({ sum: s });
  // };
}

main();
