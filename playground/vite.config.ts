import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";
import uni from "@dcloudio/vite-plugin-uni";
import Unplugin from "../src/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Inspect(),
    Unplugin({
      dts: "./src/types/routes.d.ts",
    }),
    uni(),
  ],
});
