"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkB6QLAEHFcjs = require('./chunk-B6QLAEHF.cjs');

// src/astro.ts
var astro_default = (options) => ({
  name: "unplugin-starter",
  hooks: {
    "astro:config:setup": async (astro) => {
      var _a;
      (_a = astro.config.vite).plugins || (_a.plugins = []);
      astro.config.vite.plugins.push(_chunkB6QLAEHFcjs.index_default.vite(options));
    }
  }
});


exports.default = astro_default;

module.exports = exports.default;
