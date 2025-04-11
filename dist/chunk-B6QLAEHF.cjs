"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/index.ts
var _unplugin = require('unplugin');
var _path = require('path');
var _fs = require('fs');
var _compilersfc = require('@vue/compiler-sfc');
var _merge = require('lodash/merge'); var _merge2 = _interopRequireDefault(_merge);
var _vite = require('vite');
var unpluginFactory = (options) => {
  const pagesDir = (options == null ? void 0 : options.pagesDir) || "src/pages";
  const outputJson = (options == null ? void 0 : options.outputJson) || "src/pages.json";
  const enableDts = (options == null ? void 0 : options.dts) || false;
  const defaultPagesConfig = (options == null ? void 0 : options.defaultPagesConfig) || "src/defaultPages.json";
  async function generatePagesJson() {
    const pagesAbsoluteDir = _path.resolve.call(void 0, process.cwd(), pagesDir);
    const outputJsonPath = _path.resolve.call(void 0, process.cwd(), outputJson);
    const pageFiles = await getVueFiles(pagesAbsoluteDir);
    const pages = [];
    for (const file of pageFiles) {
      const relativePath = _path.relative.call(void 0, pagesAbsoluteDir, file);
      const defaultPath = _vite.normalizePath.call(void 0, 
        `pages/${relativePath.replace(/\.vue$/, "")}`
      );
      const vueContent = await _fs.promises.readFile(file, "utf-8");
      const { routeBlockConfig } = extractRouteConfigs(vueContent);
      const pageConfig = _merge2.default.call(void 0, 
        { path: defaultPath },
        routeBlockConfig || {}
      );
      pages.push(pageConfig);
    }
    let defaultPagesConfigContent = {};
    console.log(_fs.existsSync.call(void 0, _path.resolve.call(void 0, process.cwd(), defaultPagesConfig)));
    if (_fs.existsSync.call(void 0, _path.resolve.call(void 0, process.cwd(), defaultPagesConfig))) {
      try {
        defaultPagesConfigContent = await _fs.promises.readFile(defaultPagesConfig, {
          encoding: "utf-8"
        });
        defaultPagesConfigContent = JSON.parse(defaultPagesConfigContent);
      } catch (err) {
        console.error(`Failed to read default pages config file: ${err}`);
      }
    }
    const mergedPagesJson = _merge2.default.call(void 0, defaultPagesConfigContent, {
      pages
    });
    const pagesJson = JSON.stringify(mergedPagesJson, null, 2);
    await _fs.promises.writeFile(outputJsonPath, pagesJson, "utf-8");
    console.log("pages.json has been updated.");
    if (enableDts) {
      const dtsPath = typeof enableDts === "string" ? _path.resolve.call(void 0, process.cwd(), enableDts) : _path.resolve.call(void 0, process.cwd(), "typed-router.d.ts");
      await generateDtsFile(pages, dtsPath);
    }
  }
  async function generateDtsFile(pages, filePath) {
    const dir = _path.dirname.call(void 0, filePath);
    try {
      await _fs.promises.mkdir(dir, { recursive: true });
    } catch (err) {
      console.error(`Failed to create directory: ${dir}`, err);
    }
    const routes = pages.map((page) => {
      const path = page.path || "/";
      const alias = page.alias ? ` | ${JSON.stringify(page.alias).replace(/^\[|\]$/g, "")}` : "";
      return `"${path}"${alias}`;
    });
    const dtsContent = `declare module "typed-router" {
  export type RoutePaths = ${routes.join(" | ")};
}`;
    await _fs.promises.writeFile(filePath, dtsContent, "utf-8");
    console.log(`TypeScript declaration file has been written to ${filePath}`);
  }
  async function getVueFiles(dir) {
    const entries = await _fs.promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map((entry) => {
        const fullPath = _path.resolve.call(void 0, dir, entry.name);
        return entry.isDirectory() ? getVueFiles(fullPath) : entry.name.endsWith(".vue") ? [fullPath] : [];
      })
    );
    return files.flat();
  }
  function extractRouteConfigs(vueContent) {
    const { descriptor } = _compilersfc.parse.call(void 0, vueContent);
    let routeBlockConfig = null;
    if (descriptor.customBlocks) {
      const routeBlock = descriptor.customBlocks.find(
        (block) => block.type === "route"
      );
      if (routeBlock) {
        try {
          routeBlockConfig = JSON.parse(routeBlock.content);
        } catch (e) {
          console.error("Failed to parse <route> block:", e);
        }
      }
    }
    return { routeBlockConfig };
  }
  return {
    name: "unplugin-starter",
    async buildStart() {
      await generatePagesJson();
    },
    async watchChange(id) {
      if (id.startsWith(_path.resolve.call(void 0, process.cwd(), pagesDir))) {
        console.log("Detected changes in pages directory, regenerating...");
        await generatePagesJson();
      }
    }
  };
};
var unplugin = /* @__PURE__ */ _unplugin.createUnplugin.call(void 0, unpluginFactory);
var index_default = unplugin;





exports.unpluginFactory = unpluginFactory; exports.unplugin = unplugin; exports.index_default = index_default;
