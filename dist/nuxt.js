import {
  vite_default
} from "./chunk-NM6I4624.js";
import {
  webpack_default
} from "./chunk-MB6HCKQW.js";
import "./chunk-FWMBGXH6.js";

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
