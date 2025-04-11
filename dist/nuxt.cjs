"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkECRVFBI7cjs = require('./chunk-ECRVFBI7.cjs');


var _chunkKWFGUAPWcjs = require('./chunk-KWFGUAPW.cjs');
require('./chunk-B6QLAEHF.cjs');

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
    _kit.addVitePlugin.call(void 0, () => _chunkECRVFBI7cjs.vite_default.call(void 0, options));
    _kit.addWebpackPlugin.call(void 0, () => _chunkKWFGUAPWcjs.webpack_default.call(void 0, options));
  }
});


exports.default = nuxt_default;

module.exports = exports.default;
