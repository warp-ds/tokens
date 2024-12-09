import fs from 'fs';
import path from 'path';
import { supportedBrandNames } from "./buildUtils.js";

// Go through all component and semantic tokens in all modes
export function processAndWriteSemanticAndComponentTokens(sourceData, tokenVariableCollection) {
  // Extract modes and variables from sourceData
  // Example: "FINN Light", "FINN dark", "Dataviz Light"
  const modes = sourceData.meta.variableCollections[tokenVariableCollection].modes;
  const supportedModes = modes.filter(
    (mode) => supportedBrandNames.some(brand => mode.name.toLowerCase().includes(brand))
  );

  const variables = sourceData.meta.variables;

  // Initialize objects for each mode
  const modeObjects = supportedModes.reduce((acc, mode) => {
    const isDataviz = mode.name.toLowerCase().includes("dataviz")
    if (isDataviz) {
      acc[mode.name] = { modeId: mode.modeId, semantic: {} };
    } else {
      acc[mode.name] = { modeId: mode.modeId, semantic: {}, components: {} };
    }
    return acc;
  }, {});

  // Process tokens for each mode
  // Only use the VariableCollection that contains component and semantic tokens
  sourceData.meta.variableCollections[tokenVariableCollection].variableIds.forEach((variableId) => {
    // get the data for the specific component or semantic token
    const variable = variables[variableId];
    if (variable && variable.resolvedType === "COLOR") {
      const tokenType = variable.name.startsWith("Components") ? "components" : "semantic";
      Object.values(modeObjects).forEach((modeObject) => {
        // Get the name of the token the variable refers to, for example "DBA/Gray/200" or "Semantic/Background/Disabled"
        const value = extractValueForMode(variable, modeObject.modeId, sourceData);

        // The path to the current semantic or component token
        const pathSegments = variable.name
          .replace(/^DV\//, "") // Drop prefix in tokens that start with DV/Semantic
          .split("/")
          .slice(1)
          .map((segment) => segment.toLowerCase());

        let currentLevel = modeObject[tokenType];

        pathSegments.forEach((segment, index) => {
          if (index === pathSegments.length - 1) {
            currentLevel[segment] = { value };
          } else {
            currentLevel[segment] = currentLevel[segment] || {};
            currentLevel = currentLevel[segment];
          }
        });
      });
    }
  });

  // Write the files for each mode
    Object.entries(modeObjects).map(([modeName, modeObject]) => {
      const dirPath = `tokens/${modeName.toLowerCase().replace(" ", "-")}`;
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(
        path.join(dirPath, "semantic.json"),
        JSON.stringify({ semantic: modeObject.semantic }, null, 2)
      );

      if (modeObject.components) {
        fs.writeFileSync(
          path.join(dirPath, "components.json"),
          JSON.stringify({ components: modeObject.components }, null, 2)
        );
      }
    })
}

// Get the value name for a given component or semantic token and mode (eg FINN Light)
function extractValueForMode(variable, modeId, sourceData) {
  // Find the ID
  const variableID = variable.valuesByMode[modeId].id;

  // Get the name
  const variableName = getVariableNameById(variableID, sourceData);

  // Determine if the variable is a semantic token, a dataviz semantic token
  // or a non-semantic token
  let formattedName;
  if (variableName.startsWith("Semantic")) {
    // For semantic tokens, keep the name as is
    const nameParts = variableName.split("/");
    formattedName = nameParts.join(".").toLowerCase();
  } else if (variableName.startsWith("DV/Semantic")) {
    // For dataviz semantic tokens, remove the "DV" prefix
    const nameParts = variableName.replace(/^DV\//, "").split("/");
    formattedName = nameParts.join(".").toLowerCase();
  } else {
    // For non-semantic tokens, replace the first segment with "Color"
    const nameParts = variableName.split("/");
    nameParts[0] = "color";
    formattedName = nameParts.join(".").toLowerCase();
  }

  // Wrap with curly braces
  return `{${formattedName}}`;
}

// Get the name of the variable referred to, bet it a Primitive value, semantic or component token
function getVariableNameById(variableId, sourceData) {
  const variable = sourceData.meta.variables[variableId];
  if (variable) {
    return variable.name;
  }
  return "Unknown Variable";
}
