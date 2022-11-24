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
  const { input, diceIndex, query } = message;
  const d = JsDice.build_from_string(input);
  console.log(`built dice from ${input} and rolled ${d.roll()}`);
  return materializeJsDice(d);
}

////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

// because the getters on jsDice are functions and not fields and are therefore not sent to the other thread.
function materializeJsDice(jsDice) {
  // const jsDice = JsDice.build_from_string("2d6"); // REMOVE

  // TODO: cumulative_distribution
  return {
    build_time: jsDice.build_time,
    builder_string: jsDice.builder_string,
    min: jsDice.min,
    max: jsDice.max,
    mode: jsDice.mode,
    median: jsDice.median,
    mean: materializeJsFraction(jsDice.mean),
    variance: materializeJsFraction(jsDice.variance),
    distribution: jsDice.distribution,
    cumulative_distribution: jsDice.cumulative_distribution,
  };
}

// because the getters on jsFraction are functions and not fields and are therefore not sent to the other thread.
function materializeJsFraction(jsFraction) {
  return {
    numer: jsFraction.numer,
    denom: jsFraction.denom,
    negative: jsFraction.negative,
    float: jsFraction.float,
  };
}

function postFail(id, message) {
  self.postMessage({ failed: true, id, message });
}

function postSuccess(id, message) {
  self.postMessage({ failed: false, id, message });
}

// function jsDiceFromPtr(ptr) {
//   const obj = Object.create(JsDice.prototype);
//   obj.ptr = ptr;
//   return obj;
// }
