import type { Action, Middleware } from "@reduxjs/toolkit";
import type { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import type { Actions } from "./actions";
import type { RootState } from "./reducer";

export class SafeDispatchInRecuderMiddleware {
  actionQueue: Actions.AppStateAction[];

  store: ToolkitStore | undefined;
  isExecuting: boolean;

  constructor() {
    this.actionQueue = [];
    this.isExecuting = false;
  }

  connectStore(store: ToolkitStore) {
    this.store = store;
  }

  createMiddlewareFunction(): Middleware<{}, RootState> {
    return (storeApi) => (next) => async (action: Actions.AppStateAction) => {
      this.isExecuting = true;
      next(action);
      while (this.actionQueue.length >= 1) {
        let nextAction = this.actionQueue.shift()!;
        storeApi.dispatch(nextAction);
      }
      this.isExecuting = false;
    };
  }

  /**
   * provides a safe abstraction over store.dispatch().
   * In case it is called in the reducer it ensures that the `action` is always dispatched the current action dispatch has finished.
   * @param action
   */
  dispatch(action: Actions.AppStateAction) {
    if (this.isExecuting) {
      this.actionQueue.push(action);
    } else {
      this.store?.dispatch(action);
    }
  }
}
