import type { UnpluginFactory } from "unplugin";
import type { Options } from "./types";
import { createUnplugin } from "unplugin";
import { resolve, relative, dirname } from "path";
import { promises as fs, existsSync } from "fs";
import { parse } from "@vue/compiler-sfc";
import merge from "lodash/merge";
import { normalizePath } from "vite";

// 定义页面配置的类型
interface PageConfig {
  [key: string]: any;
}

// 定义 pages.json 的类型
type PagesJson = {
  pages: PageConfig[];
  [key: string]: any; // 允许其他全局字段（如 globalStyle 等）
};

export const unpluginFactory: UnpluginFactory<Options | undefined> = (
  options
) => {
  const pagesDir = options?.pagesDir || "src/pages";
  const outputJson = options?.outputJson || "src/pages.json";
  const enableDts = options?.dts || false; // Whether to generate a dts file
  const defaultPagesConfig =
    options?.defaultPagesConfig || "src/defaultPages.json";

  async function generatePagesJson() {
    const pagesAbsoluteDir = resolve(process.cwd(), pagesDir);
    const outputJsonPath = resolve(process.cwd(), outputJson);

    const pageFiles = await getVueFiles(pagesAbsoluteDir);

    const pages: PageConfig[] = [];
    for (const file of pageFiles) {
      const relativePath = relative(pagesAbsoluteDir, file);
      const defaultPath = normalizePath(
        `pages/${relativePath.replace(/\.vue$/, "")}`
      );

      const vueContent = await fs.readFile(file, "utf-8");
      const { routeBlockConfig } = extractRouteConfigs(vueContent);

      const pageConfig: PageConfig = merge(
        { path: defaultPath },
        routeBlockConfig || {}
      );

      pages.push(pageConfig);
    }
    let defaultPagesConfigContent: any = {};
    console.log(existsSync(resolve(process.cwd(), defaultPagesConfig)));

    if (existsSync(resolve(process.cwd(), defaultPagesConfig))) {
      try {
        defaultPagesConfigContent = await fs.readFile(defaultPagesConfig, {
          encoding: "utf-8",
        });
        defaultPagesConfigContent = JSON.parse(defaultPagesConfigContent);
      } catch (err) {
        console.error(`Failed to read default pages config file: ${err}`);
      }
    }

    const mergedPagesJson: PagesJson = merge(defaultPagesConfigContent, {
      pages,
    });
    const pagesJson = JSON.stringify(mergedPagesJson, null, 2);
    await fs.writeFile(outputJsonPath, pagesJson, "utf-8");
    console.log("pages.json has been updated.");

    // Generate TypeScript declaration file if `dts` is enabled
    if (enableDts) {
      const dtsPath =
        typeof enableDts === "string"
          ? resolve(process.cwd(), enableDts)
          : resolve(process.cwd(), "typed-router.d.ts");
      await generateDtsFile(pages, dtsPath);
    }
  }

  async function generateDtsFile(pages: PageConfig[], filePath: string) {
    // 确保目录存在
    const dir = dirname(filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (err) {
      console.error(`Failed to create directory: ${dir}`, err);
    }

    const routes = pages.map((page) => {
      const path = page.path || "/";
      const alias = page.alias
        ? ` | ${JSON.stringify(page.alias).replace(/^\[|\]$/g, "")}`
        : "";
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

  async function getVueFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map((entry) => {
        const fullPath = resolve(dir, entry.name);
        return entry.isDirectory()
          ? getVueFiles(fullPath)
          : entry.name.endsWith(".vue")
          ? [fullPath]
          : [];
      })
    );
    return files.flat();
  }

  function extractRouteConfigs(vueContent: string) {
    const { descriptor } = parse(vueContent);

    let routeBlockConfig: PageConfig | null = null;

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
    },
  };
};

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
