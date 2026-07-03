import { cpSync, existsSync, renameSync } from "node:fs";
import { join } from "node:path";

const outputDir = ".open-next";
const workerPath = join(outputDir, "worker.js");
const pagesWorkerPath = join(outputDir, "_worker.js");
const assetsDir = join(outputDir, "assets");
const publicDir = "public";

if (existsSync(workerPath)) {
  renameSync(workerPath, pagesWorkerPath);
}

if (existsSync(assetsDir)) {
  cpSync(assetsDir, outputDir, { recursive: true, force: true });
}

if (existsSync(publicDir)) {
  cpSync(publicDir, outputDir, { recursive: true, force: true });
}
