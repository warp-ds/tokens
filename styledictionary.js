import StyleDictionary from "style-dictionary";
import fs from "fs";
import path from "path";

// Custom transform to preserve hex values with alpha exactly as they appear in the JSON
StyleDictionary.registerTransform({
  name: 'color/hexAlpha',
  type: 'value',
  matcher: function(prop) {
    return prop.attributes.category === 'color';
  },
  transformer: function(prop) {
    return prop.value; // Use the hex value exactly as it appears in the JSON
  }
});

// Register tokens-dynamic-swift-format for iOS token generation
StyleDictionary.registerFormat({
  name: 'tokens-dynamic-swift-format',
  formatter: function({ dictionary, file, options }) {
    console.log(`Inside tokens-dynamic-swift-format formatter for ${file.destination}`);

    const brandName = file.destination.split('/').pop().replace('Tokens.swift', ''); // Extract brand name from the file path

    // Generate SwiftUI Color dynamic colors
    const swiftUIColorBlock = dictionary.allProperties.map(token => {
      let name = toCamelCase(token.path.join('')); // Convert to camelCase
      if (name.startsWith("semanticcolor")) {
        name = name.replace("semanticcolor", ""); // Remove 'semanticcolor' prefix
      }
      name = name.replace(/-/g, ''); // Remove all dashes

      const lightValue = token.lightValue || token.value;  // Light mode value
      const darkValue = token.darkValue || lightValue;  // Dark mode value (if available)

      if (!lightValue || !darkValue) {
        console.error(`Unresolved reference for ${name} in ${brandName} - Skipping token.`);
        return ''; // Skip tokens with unresolved references
      }

      return `    public var ${name}: Color { Color.dynamicColor(defaultColor: "${lightValue}", darkModeColor: "${darkValue}") }`;
    }).join('\n');

    // Generate UIKit UIColor dynamic colors
    const uiColorBlock = dictionary.allProperties.map(token => {
      let name = toCamelCase(token.path.join('')); // Convert to camelCase
      if (name.startsWith("semanticcolor")) {
        name = name.replace("semanticcolor", ""); // Remove 'semanticcolor' prefix
      }
      name = name.replace(/-/g, ''); // Remove all dashes

      const lightValue = token.lightValue || token.value;  // Light mode value
      const darkValue = token.darkValue || lightValue;  // Dark mode value (if available)

      if (!lightValue || !darkValue) {
        console.error(`Unresolved reference for ${name} in ${brandName} - Skipping token.`);
        return ''; // Skip tokens with unresolved references
      }

      return `    public var ${name}: UIColor { UIColor.dynamicColor(defaultColor: "${lightValue}", darkModeColor: "${darkValue}") }`;
    }).join('\n');

    return `import SwiftUI

@preconcurrency @MainActor
struct ${brandName}TokenProvider {
${swiftUIColorBlock}
}

@preconcurrency @MainActor
struct ${brandName}UITokenProvider {
${uiColorBlock}
}`;
  }
});

// Register combined-swiftui-uikit-color-format for primitive colors
StyleDictionary.registerFormat({
  name: 'combined-swiftui-uikit-color-format',
  formatter: function({ dictionary, file, options }) {
    console.log(`Generating brand colors for ${file.destination}`);

    const brandName = file.destination.split('/').pop().replace('Color.swift', ''); // Extract brand name from the file path

    // Generate SwiftUI and UIKit colors based on the brand's primitive colors
    const swiftUIColorBlock = dictionary.allProperties.map(token => {
      const nameParts = token.path.filter(part => part.toLowerCase() !== 'color');
      const name = nameParts.join('').replace(/-/g, ''); // Remove dashes and combine

      return `    static let ${name} = Color(hex: "${token.value}")`;
    }).join('\n');

    const uiColorBlock = dictionary.allProperties.map(token => {
      const nameParts = token.path.filter(part => part.toLowerCase() !== 'color');
      const name = nameParts.join('').replace(/-/g, ''); // Remove dashes and combine

      return `    static let ${name} = UIColor(hex: "${token.value}")`;
    }).join('\n');

    return `import SwiftUI

// Generated by https://github.com/warp-ds/tokens
struct ${brandName}Colors {
${swiftUIColorBlock}
}

struct ${brandName}UIColors {
${uiColorBlock}
}`;
  }
});

// Helper function to convert dashed and lowercased names to camelCase
function toCamelCase(str) {
  return str
    .split(/[-_]/g) // Split by dashes or underscores
    .map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of every word except the first
    .join(''); // Join the words together to form a camelCase string
}

// Function to generate iOS-specific dynamic tokens for each brand
function generateTokensForIOS() {
  const tokensPath = "./tokens";
  const iosTokensFolder = `output/ios/Tokens/`;  // Folder for iOS tokens

  // Create output folder for Tokens
  if (!fs.existsSync(iosTokensFolder)) {
    fs.mkdirSync(iosTokensFolder, { recursive: true });
    console.log(`Created output folder: ${iosTokensFolder}`);
  }

  const brandModes = fs
    .readdirSync(tokensPath)
    .filter((item) => fs.statSync(path.join(tokensPath, item)).isDirectory());

  // Create a set to track unique brand names (e.g., 'finn', 'blocket')
  const uniqueBrands = new Set(
    brandModes.map((brandMode) => brandMode.split("-")[0])
  );

  uniqueBrands.forEach((brand) => {
    console.log(`Processing tokens for brand: ${brand}`);

    const lightTokenFilePath = path.join(tokensPath, `${brand}-light`, "semantic.json");
    const darkTokenFilePath = path.join(tokensPath, `${brand}-dark`, "semantic.json");
    const colorFilePath = path.join(tokensPath, `${brand}-light`, "colors.json"); // Load the color file for reference resolution

    // Skip this brand if semantic.json files or colors.json are missing
    if (!fs.existsSync(lightTokenFilePath) || !fs.existsSync(darkTokenFilePath) || !fs.existsSync(colorFilePath)) {
      console.error(`semantic.json or colors.json not found for ${brand}`);
      return; // Skip this brand if semantic.json or colors.json doesn't exist
    }

    try {
      console.log(`Reading light token file: ${lightTokenFilePath}`);
      const lightTokens = JSON.parse(fs.readFileSync(lightTokenFilePath));
      console.log(`Reading dark token file: ${darkTokenFilePath}`);
      const darkTokens = JSON.parse(fs.readFileSync(darkTokenFilePath));
      console.log(`Reading colors file: ${colorFilePath}`);
      const colorTokens = JSON.parse(fs.readFileSync(colorFilePath));

      const iosTokensConfig = {
        source: [lightTokenFilePath, darkTokenFilePath, colorFilePath], // Include colors.json in source to resolve references
        platforms: {
          ios: {
            transformGroup: "ios-swift",
            buildPath: iosTokensFolder,
            files: [
              {
                destination: `${brand.charAt(0).toUpperCase() + brand.slice(1)}Tokens.swift`,
                format: "tokens-dynamic-swift-format",
                className: `${brand.charAt(0).toUpperCase() + brand.slice(1)}Tokens`,
              }
            ],
            transforms: ["attribute/cti", "name/cti/pascal", "color/hexAlpha"]
          },
        },
      };

      const sdTokens = StyleDictionary.extend(iosTokensConfig);
      sdTokens.buildPlatform('ios');
      console.log(`Successfully built iOS tokens for ${brand} in ${iosTokensFolder}`);
    } catch (error) {
      console.error(`Error building iOS tokens for ${brand}: ${error.message}`);
    }
  });
}

// Function to generate iOS-specific primitive colors for each brand
function generateColorsForIOS() {
  const tokensPath = "./tokens";
  const outputFolder = `output/ios/Brands/`; // Folder for iOS brand colors

  // Create output folder for iOS brand colors
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
    console.log(`Created output folder: ${outputFolder}`);
  }

  const brandModes = fs
    .readdirSync(tokensPath)
    .filter((item) => fs.statSync(path.join(tokensPath, item)).isDirectory());

  // Create a set to track unique brand names (e.g., 'finn', 'blocket')
  const uniqueBrands = new Set(
    brandModes.map((brandMode) => brandMode.split("-")[0])
  );

  uniqueBrands.forEach((brand) => {
    console.log(`Processing colors for brand: ${brand}`);

    const tokenFilePath = path.join(tokensPath, `${brand}-light`, "colors.json");

    // Check if colors.json exists before proceeding
    if (!fs.existsSync(tokenFilePath)) {
      console.error(`colors.json not found for ${brand}`);
      return; // Skip this brand if colors.json does not exist
    }

    try {
      const iosConfig = {
        source: [tokenFilePath],
        platforms: {
          ios: {
            transformGroup: "ios-swift",
            buildPath: outputFolder, // Trailing slash ensures correct file paths
            files: [
              {
                destination: `${brand.charAt(0).toUpperCase() + brand.slice(1)}Color.swift`,
                format: "combined-swiftui-uikit-color-format",
                className: `${brand.charAt(0).toUpperCase() + brand.slice(1)}Colors`,
              }
            ],
            transforms: ["attribute/cti", "name/cti/pascal", "color/hexAlpha"] // Use custom hexAlpha transform
          },
        },
      };

      const sd = StyleDictionary.extend(iosConfig);
      sd.buildPlatform('ios');
      console.log(`Successfully built iOS primitive colors for ${brand} in ${outputFolder}`);
    } catch (error) {
      console.error(`Error building iOS primitive colors for ${brand}: ${error.message}`);
    }
  });
}

// Main function to generate all assets
export function generateSDAssets() {
  // First generate the colors for iOS (Brand Colors)
  generateColorsForIOS();

  // Then generate the tokens for iOS
  generateTokensForIOS();

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
