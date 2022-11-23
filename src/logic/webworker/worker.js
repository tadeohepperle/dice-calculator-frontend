import { greet, JsDice } from "dices";

onmessage = function (msg) {
  let { type, input } = msg.data;

  if (type == "calculate") {
    try {
      let dice = JsDice.build_from_string(input);
      postMessage({ type: "success", exception: ex });
    } catch (ex) {
      postMessage({ type: "error", exception: ex });
    }
  } else {
    postMessage({
      type: "error",
      exception: "could not process msg successfully",
    });
  }
};

function jsDiceFromPtr(ptr) {
  const obj = Object.create(JsDice.prototype);
  obj.ptr = ptr;
  return obj;
}
