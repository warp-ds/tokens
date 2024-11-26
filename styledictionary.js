import StyleDictionary from "style-dictionary";
import fs from "fs";
import path from "path";
import {processIos} from './processIos.js';

// Main function to generate all assets
export function generateSDAssets() {
  processIos();

  // Preserve existing configuration for web, Android, and other platforms
  const tokensPath = "./tokens";
  const brandModes = fs
    .readdirSync(tokensPath)
    .filter((item) => fs.statSync(path.join(tokensPath, item)).isDirectory());

  brandModes.forEach((brandMode) => {
    const config = {
      source: [path.join(tokensPath, brandMode, "*.json")],
      platforms: {
        css: {
          transformGroup: "css",
          buildPath: `output/web/${brandMode}/`,
          files: [
            {
              destination: "variables.css",
              format: "css/variables",
              options: {
                outputReferences: true,
              },
            },
          ],
        },
        cssRgb: {
          transforms: [
            "attribute/cti",
            "name/cti/kebab",
            "time/seconds",
            "content/icon",
            "size/rem",
            "color/rgb",
          ],
          buildPath: `output/web/${brandMode}/`,
          files: [
            {
              destination: "variables-rgb.css",
              format: "css/variables",
              options: {
                outputReferences: true,
              },
            },
          ],
        },
        compose: {
          transformGroup: "compose",
          buildPath: `output/android/${brandMode}/`,
          files: [
            {
              destination: "StyleDictionaryColor.kt",
              format: "compose/object",
              className: "WarpColors",
              packageName: "com.schibsted.nmp.warp.theme",
            },
          ],
        },
      },
    };

    try {
      const sd = StyleDictionary.extend(config);
      sd.buildAllPlatforms();
      console.log(`Successfully built Style Dictionary for ${brandMode}`);
    } catch (error) {
      console.error(`Error building Style Dictionary for ${brandMode}: ${error.message}`);
    }
  });
}

export function generateSDDataVizAssets() {}
