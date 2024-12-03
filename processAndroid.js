import StyleDictionary from "style-dictionary";
import fs from "fs";
import fsExtra from "fs-extra";
import path from "path";
import "./lib/android/transform.js";
import "./lib/android/format.js";
import {
  extractTokens,
  toCamelCase,
  transformValue,
  getGeneratedDate,
} from "./lib/android/helpers.js";

const tokensPath = "./tokens";
const androidFolder = "output/android/"; // Folder for Android
const androidFolderLight = "output/android/light/"; // Folder for Android
const androidFolderDark = "output/android/dark/"; // Folder for Android


function generateLightColorsForAndroid(uniqueBrands) {
  uniqueBrands.forEach((brand) => {
    console.log(`Processing colors for brand: ${brand}`);

    const colorTokenFilePath = path.join(
      tokensPath,
      `${brand}-light`,
      "colors.json"
    );
    const semanticTokenFilePath = path.join(
      tokensPath,
      `${brand}-light`,
      "semantic.json"
    );
    const componentTokenFilePath = path.join(
      tokensPath,
      `${brand}-light`,
      "components.json"
    );

    // Check if colors.json exists before proceeding
    if (!fs.existsSync(colorTokenFilePath)) {
      console.error(`colors.json not found for ${brand}`);
      return; // Skip this brand if colors.json does not exist
    }

    try {
      const androidConfig = {
        source: [colorTokenFilePath, semanticTokenFilePath, componentTokenFilePath],
        platforms: {
          android: {
            transformGroup: "compose",
            buildPath: androidFolderLight+ `${brand}/`,
            files: [
              {
                destination:  `${
                  brand.charAt(0).toUpperCase() + brand.slice(1)
                }Colors.kt`,
                format: "compose-colors-format",           
                packageName: `com.schibsted.nmp.warp.brands.${brand}`,
              },
            ],
            transforms: ["attribute/cti", "name/cti/pascal", "color/hexAlpha"], // Use custom hexAlpha transform
          },
          xml: {
            transformGroup: "android",
            buildPath: androidFolderLight+ `${brand}/`,
            files: [
              {
                destination: "colors.xml",
                format: "colors-xml-format",
              },
            ],
          },
        },
      };

      const sd = StyleDictionary.extend(androidConfig);
      sd.buildPlatform("android");
      sd.buildPlatform("xml");
      console.log(
        `Successfully built android light colors for ${brand} in ${androidFolderLight}`
      );
    } catch (error) {
      console.error(
        `Error building android light colors for ${brand}: ${error.message}`
      );
    }
  });
}

function generateDarkColorsForAndroid(uniqueBrands) {
  uniqueBrands.forEach((brand) => {
    console.log(`Processing colors for brand: ${brand}`);

    const colorTokenFilePath = path.join(
      tokensPath,
      `${brand}-dark`,
      "colors.json"
    );
    const semanticTokenFilePath = path.join(
      tokensPath,
      `${brand}-dark`,
      "semantic.json"
    );
    const componentTokenFilePath = path.join(
      tokensPath,
      `${brand}-dark`,
      "components.json"
    );

    // Check if colors.json exists before proceeding
    if (!fs.existsSync(colorTokenFilePath)) {
      console.error(`colors.json not found for ${brand}`);
      return; // Skip this brand if colors.json does not exist
    }

    try {
      const androidConfig = {
        source: [colorTokenFilePath, semanticTokenFilePath, componentTokenFilePath],
        platforms: {
          android: {
            transformGroup: "compose",
            buildPath: androidFolderDark + `${brand}/`,
            files: [
              {
                destination:  `${
                  brand.charAt(0).toUpperCase() + brand.slice(1)
                }DarkColors.kt`,
                format: "compose-colors-format-dark",           
                packageName: `com.schibsted.nmp.warp.brands.${brand}`,
              },
            ],
            transforms: ["attribute/cti", "name/cti/pascal", "color/hexAlpha"], // Use custom hexAlpha transform
          },
          xml: {
            transformGroup: "android",
            buildPath: androidFolderDark + `${brand}/`,
            files: [
              {
                destination: "colors.xml",
                format: "colors-xml-format",
              },
            ],
          },
        },
      };

      const sd = StyleDictionary.extend(androidConfig);
      sd.buildPlatform("android");
      sd.buildPlatform("xml");
      console.log(
        `Successfully built android light colors for ${brand} in ${androidFolderDark}`
      );
    } catch (error) {
      console.error(
        `Error building android dark colors for ${brand}: ${error.message}`
      );
    }
  });
}

export const processAndroid = () => {
  fsExtra.ensureDirSync(androidFolder);
  const brandModes = fs
    .readdirSync(tokensPath)
    .filter((item) => fs.statSync(path.join(tokensPath, item)).isDirectory());

  // Create a set to track unique brand names (e.g., 'finn', 'blocket')
  const uniqueBrands = new Set(
    brandModes.map((brandMode) => brandMode.split("-")[0])
  );

  generateLightColorsForAndroid(uniqueBrands);
  generateDarkColorsForAndroid(uniqueBrands);

};
