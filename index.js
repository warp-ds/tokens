import { generateSDAssets } from "./styledictionary.js";
import { processAndWriteBrandColors } from "./processColors.js";
import { processAndWriteSemanticAndComponentTokens } from "./processTokens.js";
import { zip } from "zip-a-folder";
import fs from "fs-extra";
import ora from "ora";
import path from "node:path";
import prompts from "prompts";

// The Figma project where we can find our icons
const FIGMA_PROJECT_ID = "oHBCzDdJxHQ6fmFLYWUltf";

// Where we store the Figma token
const FIGMA_TOKEN_PATH = "./.FIGMA_TOKEN";

(async function main() {
  const spinner = ora(
    "Reading Figma access token from " + FIGMA_TOKEN_PATH
  ).start();

  let figmaToken = await readTokenFromDisk();

  if (figmaToken) {
    spinner.succeed("Using Figma access token from " + FIGMA_TOKEN_PATH);
  } else {
    spinner.warn("No Figma access token found");

    const tokenPrompt = await prompts({
      type: "text",
      name: "figmaToken",
      message:
        "Enter your Figma access token (https://www.figma.com/developers/api#access-tokens)",
    });

    figmaToken = tokenPrompt.figmaToken;

    const { saveToken } = await prompts({
      type: "confirm",
      name: "saveToken",
      message: "Would you like to save the token?",
    });

    if (saveToken) {
      await writeTokenToDisk(figmaToken);
      spinner.succeed("Saved token to " + FIGMA_TOKEN_PATH);
    }
  }

  spinner.start("Loading Figma project");

  const res = await fetch(
    `https://api.figma.com/v1/files/${FIGMA_PROJECT_ID}/variables/local`,
    {
      headers: {
        "X-FIGMA-TOKEN": figmaToken,
      },
    }
  );

  if (!res.ok) {
    throw new Error(json.err);
  }

  const json = await res.json();

  try {
    fs.ensureDirSync("./data/");

    fs.outputFileSync("./data/figma.json", JSON.stringify(json), "utf8");
    spinner.succeed(`Loaded Figma tokens`);
  } catch (e) {
    spinner.fail("Unable to load Figma tokens: " + e.message);
    return;
  }

  spinner.start("Transforming Figma tokens to design tokens");
  transform();
  spinner.succeed("Design tokens written to disk");

  spinner.start("Generating Style Dictionary assets");
  generateSDAssets();
  spinner.succeed("Style Dictionary assets generated");

  spinner.start("Zipping assets");
  await zipFiles();
  spinner.succeed("Assets zipped for publishing");
})();

function writeTokenToDisk(token) {
  return fs.outputFile(FIGMA_TOKEN_PATH, token, "utf8");
}

async function readTokenFromDisk() {
  try {
    const token = await fs.readFile(FIGMA_TOKEN_PATH, "utf8");
    return token;
  } catch {
    return "";
  }
}

function transform() {
  const token = fs.readFileSync("./data/figma.json", "utf8");
  const tokenVariableCollection = "VariableCollectionId:4546:841";
  const sourceData = JSON.parse(token);
  // Prepare the modes array from your source data
  const modes =
    sourceData.meta.variableCollections[tokenVariableCollection].modes;

  // Process and write brand color files
  processAndWriteBrandColors(
    sourceData,
    sourceData.meta.variableCollections,
    sourceData.meta.variables,
    tokenVariableCollection
  );

  // Process and write semantic and component tokens
  processAndWriteSemanticAndComponentTokens(
    sourceData,
    tokenVariableCollection
  );
}

async function zipFiles() {
  fs.ensureDirSync('./dist');
  await zip("./output/android", "./dist/android.zip");
  await zip("./output/ios", "./dist/ios.zip");
  await zip("./output/web", "./dist/web.zip");
}
