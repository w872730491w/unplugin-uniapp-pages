import {
  index_default
} from "./chunk-FWMBGXH6.js";

// src/astro.ts
var astro_default = (options) => ({
  name: "unplugin-starter",
  hooks: {
    "astro:config:setup": async (astro) => {
      var _a;
      (_a = astro.config.vite).plugins || (_a.plugins = []);
      astro.config.vite.plugins.push(index_default.vite(options));
    }
  }
});
export {
  astro_default as default
};
