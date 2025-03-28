import StyleDictionary from "style-dictionary";
import { toCamelCase, transformValue, getGeneratedDate } from "../helpers.js";

function getColor(dictionary, variant) {
  return dictionary.allProperties
    .map((token) => {
      const nameParts = token.path.filter((part) => part.toLowerCase() !== "color");
      const name = nameParts.join("").replace(/-/g, ""); // Remove dashes and combine

      const code = {
        color: `static let ${name} = Color(hex: "${token.value}")`,
        uiColor: `static let ${name} = UIColor(hex: "${token.value}")`,
      };

      return `    ${code[variant]}`;
    })
    .join("\n");
}

function getTokenProviderColor(dictionary, variant) {
  return dictionary.allProperties
    .filter((token) => !token.path[0].startsWith("color")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(2).join("-")).replace("Default", ""); // Convert to camelCase, removing first two parts

      const code = {
        color: `var ${name}: Color { get }`,
        uiColor: `var ${name}: UIColor { get }`,
      };

      return `    ${code[variant]}`;
    })
    .join("\n");
}

function getLightTokenColor(dictionary, variant, brandName) {
  return dictionary.allProperties
    .filter((token) => !token.path[0].startsWith("color")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(2).join("-")).replace("Default", ""); // Convert to camelCase, removing first two parts
      let value = transformValue(token.original.value);

      const code = {
        color: `var ${name}: Color { ${brandName.replace(/Dark|Light/g, "")}${value} }`,
        uiColor: `public var ${name}: UIColor { ${brandName.replace(/Dark|Light/g, "")}UI${value} }`,
      };

      return `    ${code[variant]}`;
    })
    .join("\n");
}

function getLightColor(dictionary, variant) {
  return dictionary.allProperties
    .filter((token) => !token.path[0].startsWith("color")) // Exclude primitive colors, only keep component colors
    .filter((token) => !token.path[1].startsWith("color")) // Exclude semantic tokens, only keep component colors
    .map((token) => {
      let name = toCamelCase(token.path.slice(1).join("-")).replace("Default", ""); // Convert to camelCase, removing first part
      let value = transformValue(token.original.value);

      const code = {
        color: `var ${name}: Color { ${brandName.replace(/Dark|Light/g, "")}${value} }`,
        uiColor: `var ${name}: UIColor { ${brandName.replace(/Dark|Light/g, "")}UI${value} }`,
      };

      return `    ${code[variant]}`;
    })
    .join("\n");
}

// Register combined-swiftui-uikit-color-format for primitive colors
StyleDictionary.registerFormat({
  name: "combined-swiftui-uikit-color-format",
  formatter: function ({ dictionary, file, options }) {
    // console.log(`Generating brand colors for ${file.destination}`);

    const brandName = getBrandName(file, "Colors.swift");

    // Generate SwiftUI and UIKit colors based on the brand's primitive colors
    const swiftUIColorBlock = getColor(dictionary, "color");
    const uiColorBlock = getColor(dictionary, "uiColor");

    return `import SwiftUI

// Generated on ${getGeneratedDate()} by https://github.com/warp-ds/tokens
struct ${brandName}Colors {
${swiftUIColorBlock}
}

struct ${brandName}UIColors {
${uiColorBlock}
}
`;
  },
});

// Register token-provider-swift-format for iOS TokenProvider generation
StyleDictionary.registerFormat({
  name: "token-provider-swift-format",
  formatter: function ({ dictionary, file, options }) {
    /* console.log(
      `Inside token-provider-swift-format formatter for ${file.destination}`
    ); */

    const swiftUIColorBlock = getTokenProviderColor(dictionary, "color");
    const uiColorBlock = getTokenProviderColor(dictionary, "uiColor");

    return `import SwiftUI

// Generated on ${getGeneratedDate()} by https://github.com/warp-ds/tokens
public protocol TokenProvider {
${swiftUIColorBlock}
}

public protocol UITokenProvider {
${uiColorBlock}
}
`;
  },
});

// Register tokens-swift-format for iOS light token generation
StyleDictionary.registerFormat({
  name: "tokens-swift-format",
  formatter: function ({ dictionary, file, options }) {
    /* console.log(
      `Inside tokens-swift-format formatter for ${file.destination}`
    ); */

    const brandName = getBrandName(file, "Tokens.swift");

    const swiftUIColorBlock = getLightTokenColor(dictionary, "color", brandName);
    const uiColorBlock = getLightTokenColor(dictionary, "uiColor", brandName);

    return `import SwiftUI
  
  // Generated on ${getGeneratedDate()} by https://github.com/warp-ds/tokens
  struct ${brandName}TokenProvider: TokenProvider {
  ${swiftUIColorBlock}
  }
  
  struct ${brandName}UITokenProvider: UITokenProvider {
  ${uiColorBlock}
  }`;
  },
});

// Register colors-swift-format for iOS light color generation
StyleDictionary.registerFormat({
  name: "colors-swift-format",
  formatter: function ({ dictionary, file, options }) {
    /* console.log(
      `Inside colors-swift-format formatter for ${file.destination}`
    ); */

    const brandName = getBrandName(file, "Colors.swift");

    const swiftUIColorBlock = getLightColor(dictionary, "color");
    const uiColorBlock = getLightColor(dictionary, "uiColor");

    return `import SwiftUI
  
  // Generated on ${getGeneratedDate()} by https://github.com/warp-ds/tokens
  struct ${brandName}ColorProvider {
  ${swiftUIColorBlock}
  }
  
  struct ${brandName}UIColorProvider {
  ${uiColorBlock}
  }`;
  },
});
