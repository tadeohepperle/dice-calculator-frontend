import type { JsDice } from "dices";
import { wait } from "./functions_depr";

import Worker from "./worker.js?worker";

export async function workerExperiment() {
  console.log("start ww experiment");
  let w = new Worker();
  await wait(500);
  w.postMessage("go");
  w.onmessage = function (msg) {
    console.log("main thread recieved: ", msg.data);
  };
}

// let worker: Worker | undefined;
// if (window.Worker) {
//   restartWorker();
// }

// let transmitter: {
//   resolver: null | ((value: JsDice | PromiseLike<JsDice>) => void);
//   rejecter: null | ((reason?: any) => void);
//   reset: () => void;
//   set: (
//     res: (value: JsDice | PromiseLike<JsDice>) => void,
//     rej: (reason?: any) => void
//   ) => void;
// } = {
//   resolver: null,
//   rejecter: null,
//   reset: function () {
//     this.rejecter = null;
//     this.resolver = null;
//   },
//   set: function (res, rej) {
//     this.rejecter = rej;
//     this.resolver = res;
//   },
// };

// const WASM_COMPUTATION_TIMEOUT: number = 5000;
// export function wasmComputeDice(input: string): Promise<JsDice> {
//   return new Promise<JsDice>((res, rej) => {
//     transmitter.set(res, rej);
//     // Either the computation finishes on time => resolve
//     sendCalculationInputToWorker(input);
//     // or the time runs out => reject
//     setTimeout(() => {
//       rej(
//         `WASM_COMPUTATION_TIMEOUT=${WASM_COMPUTATION_TIMEOUT}ms expired. restarting webworker to abort all calculations.`
//       );
//       transmitter.reset();
//       restartWorker();
//     }, WASM_COMPUTATION_TIMEOUT);
//   });
// }

// function restartWorker() {
//   return;
//   // worker = new Worker("./js/webworker.js");
//   //   worker.onmessage = (e) => {
//   //     let { data } = e;
//   //     let { type, dice, exception } = data;
//   //     if (type === "success") {
//   //       if (transmitter.resolver !== null) {
//   //         transmitter.resolver(dice as JsDice);
//   //       }
//   //     }
//   //     if (type === "error") {
//   //       if (transmitter.rejecter !== null) {
//   //         transmitter.rejecter(exception);
//   //       }
//   //     }
//   //     transmitter.reset();
//   //   };
// }

// function sendCalculationInputToWorker(input: string): void {
//   if (!worker) {
//     throw "Attempts to send calculation input to worker but worker is not available.";
//   }
//   worker.postMessage({ type: "calculate", input });
// }
