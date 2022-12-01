import type { Actions } from "./../redux/actions";
import type {
  PdfAndCdfDistributionChartData,
  RollResult,
} from "./../data_types";
import { JsDice } from "dices";
import type { DiceIndex, JsDiceMaterialized } from "../data_types";
import { WorkerMessages } from "./worker_messages";

// @ts-ignore
// import Worker from "./worker.ts?worker";
import { wait } from "../utils";

////////////////////////////////////////////////////////////////////////////////
// SETUP WEB WORKER
////////////////////////////////////////////////////////////////////////////////

let worker: Worker | undefined;

let workerSetupDone = false;
function startOrRestartWorker() {
  if (worker) {
    worker.terminate();
  }
  worker = new Worker("worker/worker.js", { type: "module" });
  ensureWorkerIsPresent();
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
  percentileQuery: number | undefined,
  probabilityQuery: number | undefined
): Promise<[JsDiceMaterialized, PdfAndCdfDistributionChartData | "unchanged"]> {
  await ensureWorkerIsPresent();
  console.log("MAIN: wasmComputeDice started");
  const message = WorkerMessages.calculateMessage(
    diceIndex,
    input,
    percentileQuery,
    probabilityQuery
  );
  const { payload } = await postMessageAndAwaitResponse<
    WorkerMessages.CalculateMessage,
    WorkerMessages.CalculateResponse
  >(worker!, message);

  const { dice, chartData } = payload;
  console.log("MAIN: wasmComputeDice returned", dice);
  return [dice, chartData];
}

export async function wasmComputeProbabilities(
  probabilityQuery: number
): Promise<WorkerMessages.CalculateProbabilityResponse["payload"]> {
  await ensureWorkerIsPresent();
  let message = WorkerMessages.calculateProbabilityMessage([
    { diceIndex: 0, probabilityQuery },
    { diceIndex: 1, probabilityQuery },
    { diceIndex: 2, probabilityQuery },
  ]);

  let { payload } = await postMessageAndAwaitResponse<
    WorkerMessages.CalculateProbabilityMessage,
    WorkerMessages.CalculateProbabilityResponse
  >(worker!, message);

  return payload;
}

export async function wasmComputePercentiles(
  percentileQuery: number
): Promise<WorkerMessages.CalculatePerccentileResponse["payload"]> {
  await ensureWorkerIsPresent();
  let message = WorkerMessages.calculatePerccentileMessage([
    { diceIndex: 0, percentileQuery },
    { diceIndex: 1, percentileQuery },
    { diceIndex: 2, percentileQuery },
  ]);
  let { payload } = await postMessageAndAwaitResponse<
    WorkerMessages.CalculatePerccentileMessage,
    WorkerMessages.CalculatePerccentileResponse
  >(worker!, message);

  return payload;
}

/**
 * Does not delete the computed dice itself. It is kept in the workers memory for future potential cache hits.
 * Instead it recomputes the chartData where the removal should be visible.
 * @param diceIndex
 */
export async function wasmRemoveDice(
  diceIndex: DiceIndex
): Promise<PdfAndCdfDistributionChartData | "unchanged" | undefined> {
  await ensureWorkerIsPresent();
  const message = WorkerMessages.removeDiceMessage(diceIndex);
  const { payload } = await postMessageAndAwaitResponse<
    WorkerMessages.RemoveDiceMessage,
    WorkerMessages.RemoveDiceResponse
  >(worker!, message);

  return payload.chartData;
}

export async function wasmRoll(
  rollPayload: Actions.RollPayload
): Promise<RollResult> {
  await ensureWorkerIsPresent();
  const message = WorkerMessages.rollMessage(rollPayload);
  const { payload } = await postMessageAndAwaitResponse<
    WorkerMessages.RollMessage,
    WorkerMessages.RollResponse
  >(worker!, message);
  return payload;
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
        if (returnedData.id === id) {
          worker.removeEventListener("message", listener, false);
          if (returnedData.failed) {
            rej(returnedData.message);
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
      console.error(ex);
      rej(ex);
    }
  });
}

async function ensureWorkerIsPresent() {
  if (!worker) {
    throw "Cannot compute dice, because worker is not setup!";
  }
  await waitForWorkerSetupSuccess();
  console.log("MAIN: worker setup success");
}

function waitForWorkerSetupSuccess(): Promise<void> {
  return new Promise((res, rej) => {
    if (workerSetupDone) {
      res();
    } else {
      const listener = function (e: MessageEvent<any>) {
        let returnedData = e.data;
        if (returnedData.id === 2) {
          worker!.removeEventListener("message", listener, false);
          workerSetupDone = true;
          res();
        }
      };
      worker!.addEventListener("message", listener, false);
    }
  });
}
