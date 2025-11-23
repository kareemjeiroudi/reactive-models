import { rm as removeDirectory } from "node:fs/promises";
import type { BuildConfig, BunPlugin } from "bun";
import chokidar from "chokidar";

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

import { createProgram } from "typescript";

export const dtsPlugin: BunPlugin = {
  name: "dts-emitter",
  setup(build) {
    const inputFiles = new Set<string>();

    build.onLoad({ filter: /\.[jt]sx?$/ }, (args) => {
      inputFiles.add(args.path);
    });

    build.onEnd(() => {
      const program = createProgram([...inputFiles], {
        declaration: true,
        emitDeclarationOnly: true,
        outDir: "dist/dts",
      });

      program.emit();
    });
  },
};

const esbuildProblemMatcherPlugin: BunPlugin = {
  name: "esbuild-problem-matcher",

  setup(build) {
    build.onStart(() => {
      console.debug("[watch] build started ✅");
    });

    build.onEnd((result) => {
      result.logs.forEach(({ name, message, level, position }) => {
        console.error(`✘ [${level}] ${name}`);
        console.error(`--> ${message}`);
        console.error(`    ${position?.file}:${position?.line}:${position?.column}:`);
      });

      console.log("[watch] build finished ✅");
    });
  },
};

async function build() {
  await removeDirectory("./dist", { recursive: true, force: true });

  await buildFor("cjs");
  await buildFor("esm");
}

async function buildFor(format: BuildConfig["format"]) {
  const ext = format === "cjs" ? "cjs" : "mjs";
  await Bun.build({
    entrypoints: ["src/index.ts"],
    outdir: `dist/${format}`,
    naming: `[dir]/[name].${ext}`,
    target: "node",
    format,
    minify: production,
    sourcemap: watch ? "inline" : "none",
    splitting: true,
    tsconfig: "./tsconfig.json",
    plugins: [dtsPlugin, esbuildProblemMatcherPlugin],
    external: ["react", "react-dom"],
  });
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});

if (watch) {
  console.log("👀 Watching file changes in reative-models");
  const watcher = chokidar.watch(["./src"], {
    ignoreInitial: true,
  });

  watcher.on("all", async (event, path) => {
    console.log(`↻ [${event}] ${path}`);
    build().catch((e) => {
      console.error(e);
      process.exit(1);
    });
  });
}
