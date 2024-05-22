import fs from 'fs';
import path from 'path';

// Process and write brand color files
export function processAndWriteBrandColors(sourceData, variableCollections, variables, tokenVariableCollection) {
  Object.entries(variableCollections).forEach(([collectionId, collection]) => {
    if (
      !collection.remote &&
      collectionId !== tokenVariableCollection
    ) {
      const brandName = collection.modes[0].name; // Brand name from the first mode
      const brandColors = {};

      collection.variableIds.forEach((variableId) => {
        const variable = variables[variableId];
        if (variable && variable.resolvedType === "COLOR") {
          const colorNameParts = variable.name.split("/");
          const colorValue = variable.valuesByMode[collection.defaultModeId];

          if (colorValue) {
            if (colorNameParts.length === 3) {
              // Color belongs to a group
              const colorCategory = colorNameParts[1].toLowerCase();;
              const colorShade = colorNameParts[2].toLowerCase();;

              if (!brandColors[colorCategory]) {
                brandColors[colorCategory] = {};
              }
              brandColors[colorCategory][colorShade] = {
                value: rgbaToString(colorValue),
              };
            } else if (colorNameParts.length === 2) {
              // Color does not belong to a group
              const colorName = colorNameParts[1].toLowerCase();
              brandColors[colorName] = { value: rgbaToString(colorValue) };
            }
          }
        }
      });

      if (Object.keys(brandColors).length > 0) {
        // Write the colors.json for each mode (light and dark)
        ["light", "dark"].forEach((mode) => {
          const dirPath = `tokens/${brandName} ${mode}`;
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          fs.writeFileSync(
            path.join(dirPath, "colors.json"),
            JSON.stringify({ color: brandColors }, null, 2)
          );
        });
      }
    }
  });
}

// Convert RGBA object to hex. Return 8 numbers if alpha/transparency is not 100%
function rgbaToHex(r, g, b, a) {
  const toHex = (c) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  
  let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  
  if (a !== 1) {
    hex += toHex(a);
  }
  return hex;
}

// Process RGBA if valid
function rgbaToString(rgba) {
  if (
    rgba &&
    rgba.r !== undefined &&
    rgba.g !== undefined &&
    rgba.b !== undefined &&
    rgba.a !== undefined
  ) {
    return rgbaToHex(rgba.r, rgba.g, rgba.b, rgba.a);
  }
  return null;
}
