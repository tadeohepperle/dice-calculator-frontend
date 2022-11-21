import("./pkg/dices.js").then((dices) => {
  console.log("Success");
});

// import("./pkg/dices.js").then((dices) => {

//   onmessage = function (msg) {
//     let { type, input } = msg;
//     fetch("http://localhost:6969/", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         warn: `received message of type=${type} for input=${input}`,
//       }),
//     });
//     if (type == "calculate") {
//       try {
//         let dice = dices.JsDice.build_from_string(input);
//         postMessage({ type: "success", dice });
//       } catch (ex) {
//         postMessage({ type: "error", exeption: ex });
//       }
//     }

//     postMessage({
//       type: "error",
//       exeption: "could not process msg successfully",
//     });
//   };

//   fetch("http://localhost:6969/", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ info: "web worker with wasm is setup now" }),
//   });
// });
