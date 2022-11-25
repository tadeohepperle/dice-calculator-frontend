import { JsDice } from "dices";
import type { DiceIndex, JsDiceMaterialized } from "../data_types";
import { WorkerMessages } from "./worker_messages";

import Worker from "./worker.ts?worker";

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
  diceIndex: DiceIndex,
  input: string,
  percentileQuery: number,
  probabilityQuery: number
): Promise<JsDiceMaterialized> {
  if (!worker) {
    throw "Cannot compute dice, because worker is not setup!";
  }
  let message = WorkerMessages.calculateMessage(
    diceIndex,
    input,
    percentileQuery,
    probabilityQuery
  );
  let { payload: diceMaterialized } = await postMessageAndAwaitResponse<
    WorkerMessages.CalculateMessage,
    WorkerMessages.CalculateResponse
  >(worker, message);
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
function postMessageAndAwaitResponse<
  M extends WorkerMessages.WorkerMessage,
  R extends WorkerMessages.WorkerResponse
>(worker: Worker, message: M): Promise<R> {
  return new Promise((res, rej) => {
    try {
      const id = Math.random();
      const listener = function (e: MessageEvent<any>) {
        let returnedData: WorkerMessages.PackedWorkerResponse<R> = e.data;
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
      const packedMessage: WorkerMessages.PackedWorkerMessage<M> = {
        id,
        message,
      };
      worker.postMessage(packedMessage);
    } catch (ex) {
      rej(ex);
    }
  });
}
