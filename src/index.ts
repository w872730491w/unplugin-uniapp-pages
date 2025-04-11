import type { UnpluginFactory } from "unplugin";
import type { Options } from "./types";
import { createUnplugin } from "unplugin";
import { resolve, relative } from "path";
import { promises as fs } from "fs";
import { parse } from "@vue/compiler-sfc";
import { merge } from "lodash-es";

// 定义页面配置的类型
interface PageConfig {
  [key: string]: any;
}

// 定义 pages.json 的类型
type PagesJson = {
  pages: PageConfig[];
  [key: string]: any; // 允许其他全局字段（如 globalStyle 等）
};

const virtualDefinePageId = "virtual:define-page";
const resolvedVirtualDefinePageId = "\0" + virtualDefinePageId;

export const unpluginFactory: UnpluginFactory<Options | undefined> = (
  options
) => {
  const pagesDir = options?.pagesDir || "src/pages";
  const outputJson = options?.outputJson || "pages.json";
  const enableDts = options?.dts || false; // Whether to generate a dts file

  async function generatePagesJson() {
    const pagesAbsoluteDir = resolve(process.cwd(), pagesDir);
    const outputJsonPath = resolve(process.cwd(), outputJson);

    const pageFiles = await getVueFiles(pagesAbsoluteDir);

    const pages: PageConfig[] = [];
    for (const file of pageFiles) {
      const relativePath = relative(pagesAbsoluteDir, file);
      const defaultPath = `/${relativePath.replace(/\.vue$/, "")}`;

      const vueContent = await fs.readFile(file, "utf-8");
      const { definePageConfig, routeBlockConfig } =
        extractRouteConfigs(vueContent);

      const pageConfig: PageConfig = merge(
        { path: defaultPath },
        routeBlockConfig || {},
        definePageConfig || {}
      );

      pages.push(pageConfig);
    }

    let existingPagesJson: PagesJson = { pages: [] };
    try {
      const existingContent = await fs.readFile(outputJsonPath, "utf-8");
      existingPagesJson = JSON.parse(existingContent);
    } catch {
      console.log("No existing pages.json found, creating a new one.");
    }

    const mergedPagesJson: PagesJson = merge(existingPagesJson, { pages });
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
    const routes = pages.map((page) => {
      const path = page.path || "/";
      const alias = page.alias
        ? ` | ${JSON.stringify(page.alias).replace(/^\[|\]$/g, "")}`
        : "";
      return `"${path}"${alias}`;
    });

    const dtsContent = `declare module "typed-router" {
  export type RoutePaths = ${routes.join(" | ")};
  export function useTypedRouter(): {
    push(path: RoutePaths): void;
    replace(path: RoutePaths): void;
  };
}`;
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

    let definePageConfig: PageConfig | null = null;
    let routeBlockConfig: PageConfig | null = null;

    if (descriptor.scriptSetup) {
      const setupContent = descriptor.scriptSetup.content;
      const match = setupContent.match(/definePage\(([\s\S]*?)\)/);
        if (match) {
          console.log(match);
          
        // try {
        //   definePageConfig = eval(`(${match[1]})`);
        // } catch (e) {
        //   console.error("Failed to parse definePage config:", e);
        // }
      }
    }

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

    return { definePageConfig, routeBlockConfig };
  }

  return {
    name: "unplugin-starter",
    resolveId(id) {
      if (id === virtualDefinePageId) {
        return resolvedVirtualDefinePageId;
      }
    },
    load(id) {
      if (id === resolvedVirtualDefinePageId) {
        return `
          export function definePage(config: {
           [key: string]: any
          }): void;
        `;
      }
    },
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
