import { fetchAndTransformTokens, zipFiles } from "./buildUtils.js";

(async function main() {
  await fetchAndTransformTokens({
    figmaProjectId: "jKb3gWUebdHyRBsK0naqB6",
    outputFilePath: "./data/datavizFigma.json",
    tokenVariableCollection: "VariableCollectionId:1:287",
    isDataviz: true,
  });

  await zipFiles();
})();