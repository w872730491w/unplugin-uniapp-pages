"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkDBU5D22Dcjs = require('./chunk-DBU5D22D.cjs');

// src/astro.ts
var astro_default = (options) => ({
  name: "unplugin-starter",
  hooks: {
    "astro:config:setup": async (astro) => {
      var _a;
      (_a = astro.config.vite).plugins || (_a.plugins = []);
      astro.config.vite.plugins.push(_chunkDBU5D22Dcjs.index_default.vite(options));
    }
  }
});


exports.default = astro_default;

module.exports = exports.default;
