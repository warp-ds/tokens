import { generateSDAssets } from "./styledictionary.js";
import { processAndWriteColors } from "./processColors.js";
import { processAndWriteSemanticAndComponentTokens } from "./processTokens.js";
import { zip } from "zip-a-folder";
import fs from "fs-extra";
import ora from "ora";
import "dotenv/config";

// The Figma project where we can find our icons
const FIGMA_PROJECT_ID = "jKb3gWUebdHyRBsK0naqB6";

const spinner = ora("Reading Figma access token");

(async function main() {
  spinner.start();

  let token = process.env.FIGMA_TOKEN;

  if (token) {
    spinner.succeed("Using Figma access token from environment viariables");
  } else {
    spinner.warn("No Figma access token found");
  }

  spinner.start("Loading DataViz Figma project");

  const res = await fetch(
    `https://api.figma.com/v1/files/${FIGMA_PROJECT_ID}/variables/local`,
    {
      headers: {
        "X-FIGMA-TOKEN": token,
      },
    }
  );

  if (!res.ok) {
    throw new Error(json.err);
  }

  const json = await res.json();

  try {
    fs.ensureDirSync("./data/");

    fs.outputFileSync("./data/dataVizFigma.json", JSON.stringify(json), "utf8");
    spinner.succeed(`Loaded DataViz Figma tokens`);
  } catch (e) {
    spinner.fail("Unable to load DataViz Figma tokens: " + e.message);
    return;
  }

  spinner.start("Transforming DataViz Figma tokens to design tokens");
  transform();
  spinner.succeed("DataViz tokens written to disk");

  spinner.start("Generating Style Dictionary assets");
  generateSDAssets();
  spinner.succeed("Style Dictionary assets generated");

  spinner.start("Zipping assets");
  await zipFiles();
  spinner.succeed("Assets zipped for publishing");
})();

function transform() {
  const token = fs.readFileSync("./data/dataVizFigma.json", "utf8");
  const tokenVariableCollection = "VariableCollectionId:1:287";
  const sourceData = JSON.parse(token);
  
  // Process and write data viz colors
  processAndWriteColors({
    variableCollections: sourceData.meta.variableCollections,
    variables: sourceData.meta.variables,
    tokenVariableCollection,
    getBrandName: () => "dataviz",
  });

  // Process and write data viz semantic tokens
  processAndWriteSemanticAndComponentTokens(
    sourceData,
    tokenVariableCollection
  );
}

async function zipFiles() {
  fs.ensureDirSync("./dist");
  await zip("./output/android", "./dist/android.zip");
  await zip("./output/ios", "./dist/ios.zip");
  await zip("./output/web", "./dist/web.zip");
}
