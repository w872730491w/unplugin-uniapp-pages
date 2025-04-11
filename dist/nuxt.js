import {
  vite_default
} from "./chunk-XZOKOCVU.js";
import {
  webpack_default
} from "./chunk-F7ZKW4RE.js";
import "./chunk-MPBOWHC6.js";

// src/nuxt.ts
import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from "@nuxt/kit";
import "@nuxt/schema";
var nuxt_default = defineNuxtModule({
  meta: {
    name: "nuxt-unplugin-starter",
    configKey: "unpluginStarter"
  },
  defaults: {
    // ...default options
  },
  setup(options, _nuxt) {
    addVitePlugin(() => vite_default(options));
    addWebpackPlugin(() => webpack_default(options));
  }
});
export {
  nuxt_default as default
};
