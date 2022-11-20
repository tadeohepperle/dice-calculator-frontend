import { defineConfig } from "astro/config";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [wasm(), tailwind(), react()],
  vite: {
    plugins: [wasm(), topLevelAwait()],
  },
});
