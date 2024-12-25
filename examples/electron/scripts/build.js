import { copyFile, rm } from "node:fs/promises";
import { build } from "esbuild";

async function main() {
  await rm("dist", { recursive: true, force: true });

  await Promise.all([
    build({
      logLevel: "debug",
      entryPoints: ["src/main.ts"],
      bundle: true,
      write: true,
      sourcemap: true,
      outdir: "dist",
      platform: "node",
      external: ["electron"],
    }),
    build({
      logLevel: "debug",
      entryPoints: ["src/preload.ts"],
      bundle: true,
      write: true,
      sourcemap: true,
      outdir: "dist",
      external: ["electron"],
    }),
    build({
      logLevel: "debug",
      entryPoints: ["src/web.ts"],
      bundle: true,
      write: true,
      sourcemap: true,
      outdir: "dist",
    }),
  ]);

  await copyFile("src/index.html", "dist/index.html");
  await copyFile("src/favicon.ico", "dist/favicon.ico");
}

(async () => await main())();
