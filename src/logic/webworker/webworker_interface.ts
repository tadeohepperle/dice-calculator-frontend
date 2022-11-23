import type { JsDice } from "dices";
import type { JsDiceMaterialized } from "../data_types";

import Worker from "./worker.js?worker";

////////////////////////////////////////////////////////////////////////////////
// SETUP WEB WORKER
////////////////////////////////////////////////////////////////////////////////

let worker: Worker | undefined;

function startOrRestartWorker() {
  if (worker) {
    worker.terminate();
  }
  worker = new Worker();
}

if (window.Worker) {
  startOrRestartWorker();
}

////////////////////////////////////////////////////////////////////////////////
// EXPORTED FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

export async function wasmComputeDice(
  input: string
): Promise<JsDiceMaterialized> {
  if (!worker) {
    throw "Cannot compute dice, because worker is not setup!";
  }
  let diceMaterialized = await postMessageAndAwaitResult(worker, {
    type: "calculate",
    input,
  });
  console.log(`Main recieved diceMaterialized:`, diceMaterialized);
  return diceMaterialized as JsDiceMaterialized;
}

////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

/**
 * The message is sent to the worker as as { id: string, message: { type: string, ... } } to the worker.
 * the worker handles the message and sends back: {id: string, failed: bool, message: any }
 * failed=false => postMessageAndAwaitResult then just returns the message part of the object returned from the worker.
 * failed=true => postMessageAndAwaitResult throws the message
 * @param worker a web worker that is worker.js
 * @param message should satisfy { type: string }
 * @returns the appropriate response to the message
 */
function postMessageAndAwaitResult(worker: Worker, message: any): Promise<any> {
  return new Promise((res, rej) => {
    try {
      const id = Math.random();
      const listener = function (e: MessageEvent<any>) {
        let returnedData = e.data;
        if (returnedData.id == id) {
          worker.removeEventListener("message", listener, false);
          if (returnedData.failed) {
            throw returnedData.message;
          } else {
            res(returnedData.message);
          }
        }
      };
      worker.addEventListener("message", listener, false);
      worker.postMessage({ id, message });
    } catch (ex) {
      rej(ex);
    }
  });
}
