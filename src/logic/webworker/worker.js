import { greet, JsDice } from "dices";

let actionTypeFunctionMap = {
  calculate: calculateHandler,
};

onmessage = function (e) {
  const { id, message } = e.data;
  if (!id || !message) {
    if (!type) {
      return postFail(
        id,
        `id or message fields missing on event.data: ${JSON.stringify(e.data)}`
      );
    }
  }
  const { type } = message;
  if (!type) {
    return postFail(
      id,
      `message: ${JSON.stringify(
        message
      )} has no field 'type' but it is required.`
    );
  }
  const fun = actionTypeFunctionMap[type];
  if (!fun) {
    return postFail(id, `action of type '${type}'`);
  }
  try {
    let result = fun(message);
    postSuccess(id, result);
  } catch (ex) {
    console.error(ex);
    postFail(id, ex);
  }
};

////////////////////////////////////////////////////////////////////////////////
// ACTION HANDLERS
////////////////////////////////////////////////////////////////////////////////

function calculateHandler(message) {
  const { input } = message;

  d = JsDice.build_from_string(input);
  console.log(`built dice from ${input} and rolled ${d.roll()}`);
  return { mean: 4 };
}

////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

function jsDiceFromPtr(ptr) {
  const obj = Object.create(JsDice.prototype);
  obj.ptr = ptr;
  return obj;
}

function postFail(id, message) {
  self.postMessage({ failed: true, id, message });
}

function postSuccess(id, message) {
  self.postMessage({ failed: false, id, message });
}
