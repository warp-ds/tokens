import { fetchAndTransformTokens } from "./utils.js";

(async function main() {
  await fetchAndTransformTokens({
    figmaProjectId: "oHBCzDdJxHQ6fmFLYWUltf",
    outputFilePath: "./data/figma.json",
    tokenVariableCollection: "VariableCollectionId:4546:841",
  });
})();
