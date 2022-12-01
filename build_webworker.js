import * as vite from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import * as path from "path";
import fs from "fs";

// node build_webworker.js
vite
  .build({
    plugins: [wasm(), topLevelAwait()],
    build: {
      outDir: "public/temp",
      lib: {
        assetsInlineLimit: 10,
        formats: ["es"],
        entry: path.resolve(".", "src/logic/webworker/worker.ts"),
        name: "YOUR_LIBRARY_NAME",
        fileName: (format) => `worker.js`,
      },
    },
  })
  .then(() => {
    fs.copyFileSync("public/temp/worker.js", "public/worker/worker.js");
    fs.rmSync("public/temp", { recursive: true, force: true });
  });
