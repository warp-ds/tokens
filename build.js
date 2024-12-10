import { zip } from "zip-a-folder";
import fs from "fs-extra";
import ora from "ora";
import { generateSDAssets } from "./styledictionary.js";

const spinner = ora();

(async function main() {
  spinner.start("Generating Style Dictionary assets");
  generateSDAssets();
  spinner.succeed("Style Dictionary assets generated");

  spinner.start("Zipping assets");
  fs.ensureDirSync("./dist");
  await zip("./output/android", "./dist/android.zip");
  await zip("./output/ios", "./dist/ios.zip");
  await zip("./output/web", "./dist/web.zip");
  spinner.succeed("Assets zipped");
})();
