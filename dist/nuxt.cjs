"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkJRBUB5KKcjs = require('./chunk-JRBUB5KK.cjs');


var _chunk5ZJDOBGVcjs = require('./chunk-5ZJDOBGV.cjs');
require('./chunk-P55SKGMU.cjs');

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
    _kit.addVitePlugin.call(void 0, () => _chunkJRBUB5KKcjs.vite_default.call(void 0, options));
    _kit.addWebpackPlugin.call(void 0, () => _chunk5ZJDOBGVcjs.webpack_default.call(void 0, options));
  }
});


exports.default = nuxt_default;

module.exports = exports.default;
