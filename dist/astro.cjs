"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkP55SKGMUcjs = require('./chunk-P55SKGMU.cjs');

// src/astro.ts
var astro_default = (options) => ({
  name: "unplugin-starter",
  hooks: {
    "astro:config:setup": async (astro) => {
      var _a;
      (_a = astro.config.vite).plugins || (_a.plugins = []);
      astro.config.vite.plugins.push(_chunkP55SKGMUcjs.index_default.vite(options));
    }
  }
});


exports.default = astro_default;

module.exports = exports.default;
