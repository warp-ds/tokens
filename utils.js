
import { processAndWriteColors } from "./processColors.js";
import { processAndWriteSemanticAndComponentTokens } from "./processTokens.js";
import fs from "fs-extra";
import ora from "ora";
import prompts from "prompts";
import "dotenv/config";

const ENV_PATH = "./.env";

export const supportedBrandNames = ["finn", "tori", "dba", "blocket", "dataviz", "neutral", "vend"];

const spinner = ora();

export async function fetchAndTransformTokens({
  figmaProjectId,
  outputFilePath,
  tokenVariableCollection,
  isDataviz = false,
}) {
  spinner.start("Reading Figma access token");

  let token = process.env.FIGMA_TOKEN;

  if (token) {
    spinner.succeed("Using Figma access token from environment variables");
  } else {
    spinner.warn("No Figma access token found");
    token = await getTokenFromPrompt();
  }

  spinner.start("Loading Figma project");

  const res = await fetch(
    `https://api.figma.com/v1/files/${figmaProjectId}/variables/local`,
    {
      headers: {
        "X-FIGMA-TOKEN": token,
      },
    }
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.err || "Failed to fetch Figma data");
  }

  try {
    fs.ensureDirSync("./data/");

    fs.outputFileSync(outputFilePath, JSON.stringify(json, null, 2), "utf8");
    spinner.succeed(`Loaded Figma tokens`);
  } catch (e) {
    spinner.fail(`Unable to load Figma tokens: ${e.message}`);
    return;
  }

  spinner.start("Transforming Figma tokens to design tokens");

  const sourceData = JSON.parse(fs.readFileSync(outputFilePath, "utf8"));

  processAndWriteColors({
    variableCollections: sourceData.meta.variableCollections,
    variables: sourceData.meta.variables,
    tokenVariableCollection,
    getBrandName: (collection) =>
      isDataviz ? "dataviz" : collection.modes[0].name,
  });

  processAndWriteSemanticAndComponentTokens(
    sourceData,
    tokenVariableCollection
  );

  spinner.succeed("Design tokens written to disk");
}

function writeEnvVarToDisk({ name, value }) {
  if (fs.existsSync(ENV_PATH)) {
    return fs.appendFileSync(ENV_PATH, `\n${name}=${value}`, "utf8");
  }

  return fs.writeFileSync(ENV_PATH, `${name}=${value}`, "utf8");
}

async function getTokenFromPrompt() {
  let figmaToken;

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
    writeEnvVarToDisk({ name: "FIGMA_TOKEN", value: figmaToken });
    spinner.succeed("Saved token to " + ENV_PATH);
  }

  return figmaToken;
}
