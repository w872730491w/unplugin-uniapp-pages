// src/index.ts
import { createUnplugin } from "unplugin";
import { resolve, relative, dirname } from "path";
import { promises as fs, existsSync } from "fs";
import { parse } from "@vue/compiler-sfc";
import merge from "lodash/merge";
import { normalizePath } from "vite";
var unpluginFactory = (options) => {
  const pagesDir = (options == null ? void 0 : options.pagesDir) || "src/pages";
  const outputJson = (options == null ? void 0 : options.outputJson) || "src/pages.json";
  const enableDts = (options == null ? void 0 : options.dts) || false;
  const defaultPagesConfig = (options == null ? void 0 : options.defaultPagesConfig) || "src/defaultPages.json";
  async function generatePagesJson() {
    var _a;
    const pagesAbsoluteDir = resolve(process.cwd(), pagesDir);
    const outputJsonPath = resolve(process.cwd(), outputJson);
    const pageFiles = await getVueFiles(pagesAbsoluteDir);
    let homePage = null;
    const pages = [];
    for (const file of pageFiles) {
      const relativePath = relative(pagesAbsoluteDir, file);
      const defaultPath = normalizePath(
        `pages/${relativePath.replace(/\.vue$/, "")}`
      );
      const vueContent = await fs.readFile(file, "utf-8");
      const { routeBlockConfig } = extractRouteConfigs(vueContent);
      if ((_a = routeBlockConfig == null ? void 0 : routeBlockConfig.unplugin) == null ? void 0 : _a.isHome) {
        if (!homePage) {
          homePage = defaultPath;
          delete routeBlockConfig.unplugin;
        } else {
          console.error(
            `Duplicate home page found: ${defaultPath} and ${homePage}`
          );
        }
      }
      const pageConfig = merge(
        { path: defaultPath },
        routeBlockConfig || {}
      );
      pages.push(pageConfig);
    }
    if (homePage) {
      pages.sort((a, b) => {
        if (a.path === homePage) {
          return -1;
        }
        return 0;
      });
    } else {
      console.error("No home page found");
    }
    let defaultPagesConfigContent = {};
    if (existsSync(resolve(process.cwd(), defaultPagesConfig))) {
      try {
        defaultPagesConfigContent = await fs.readFile(defaultPagesConfig, {
          encoding: "utf-8"
        });
        defaultPagesConfigContent = JSON.parse(defaultPagesConfigContent);
      } catch (err) {
        console.error(`Failed to read default pages config file: ${err}`);
      }
    }
    const mergedPagesJson = merge(defaultPagesConfigContent, {
      pages
    });
    const pagesJson = JSON.stringify(mergedPagesJson, null, 2);
    await fs.writeFile(outputJsonPath, pagesJson, "utf-8");
    if (enableDts) {
      const dtsPath = typeof enableDts === "string" ? resolve(process.cwd(), enableDts) : resolve(process.cwd(), "typed-router.d.ts");
      await generateDtsFile(pages, dtsPath);
    }
  }
  async function generateDtsFile(pages, filePath) {
    const dir = dirname(filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      console.error(`Failed to create directory: ${dir}`, err);
    }
    const routes = pages.map((page) => {
      const path = page.path || "/";
      const alias = page.alias ? ` | ${JSON.stringify(page.alias).replace(/^\[|\]$/g, "")}` : "";
      return `"${path}"${alias}`;
    });
    const dtsContent = `/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols
// Generated by unplugin-auto-import
// biome-ignore lint: disable
export {}
export type RoutePaths = ${routes.join(" | ")};
`;
    await fs.writeFile(filePath, dtsContent, "utf-8");
    console.log(`TypeScript declaration file has been written to ${filePath}`);
  }
  async function getVueFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map((entry) => {
        const fullPath = resolve(dir, entry.name);
        return entry.isDirectory() ? getVueFiles(fullPath) : entry.name.endsWith(".vue") ? [fullPath] : [];
      })
    );
    return files.flat();
  }
  function extractRouteConfigs(vueContent) {
    const { descriptor } = parse(vueContent);
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
    name: "unplugin-uniapp-pages",
    async buildStart() {
      await generatePagesJson();
    },
    async watchChange(id) {
      if (id.startsWith(resolve(process.cwd(), pagesDir))) {
        console.log("Detected changes in pages directory, regenerating...");
        await generatePagesJson();
      }
    }
  };
};
var unplugin = /* @__PURE__ */ createUnplugin(unpluginFactory);
var index_default = unplugin;

export {
  unpluginFactory,
  unplugin,
  index_default
};
