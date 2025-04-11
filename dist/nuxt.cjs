"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkVRLJRV63cjs = require('./chunk-VRLJRV63.cjs');


var _chunkAQB2T5AMcjs = require('./chunk-AQB2T5AM.cjs');
require('./chunk-DBU5D22D.cjs');

// src/nuxt.ts
var _kit = require('@nuxt/kit');
require('@nuxt/schema');
var nuxt_default = _kit.defineNuxtModule.call(void 0, {
  meta: {
    name: "nuxt-unplugin-starter",
    configKey: "unpluginStarter"
  },
  defaults: {
    // ...default options
  },
  setup(options, _nuxt) {
    _kit.addVitePlugin.call(void 0, () => _chunkVRLJRV63cjs.vite_default.call(void 0, options));
    _kit.addWebpackPlugin.call(void 0, () => _chunkAQB2T5AMcjs.webpack_default.call(void 0, options));
  }
});


exports.default = nuxt_default;

module.exports = exports.default;
