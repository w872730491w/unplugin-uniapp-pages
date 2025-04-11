export interface Options {
  // 自定义 src/pages 目录
  pagesDir?: string;
  // 自定义生成的 src/pages.json 路径
  outputJson?: string;
  // 生成dts
  dts?: boolean | string;
  // 默认页面配置
  defaultPagesConfig?: string;
}
