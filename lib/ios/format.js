import StyleDictionary from "style-dictionary";
import { toCamelCase, transformValue, getGeneratedDate } from "./helpers.js";

// Register combined-swiftui-uikit-color-format for primitive colors
StyleDictionary.registerFormat({
  name: "combined-swiftui-uikit-color-format",
  formatter: function ({ dictionary, file, options }) {
    // console.log(`Generating brand colors for ${file.destination}`);

    const brandName = file.destination
      .split("/")
      .pop()
      .replace("Colors.swift", ""); // Extract brand name from the file path

    // Generate SwiftUI and UIKit colors based on the brand's primitive colors
    const swiftUIColorBlock = dictionary.allProperties
      .map((token) => {
        const nameParts = token.path.filter(
          (part) => part.toLowerCase() !== "color"
        );
        const name = nameParts.join("").replace(/-/g, ""); // Remove dashes and combine

        return `    static let ${name} = Color(hex: "${token.value}")`;
      })
      .join("\n");

    const uiColorBlock = dictionary.allProperties
      .map((token) => {
        const nameParts = token.path.filter(
          (part) => part.toLowerCase() !== "color"
        );
        const name = nameParts.join("").replace(/-/g, ""); // Remove dashes and combine

        return `    static let ${name} = UIColor(hex: "${token.value}")`;
      })
      .join("\n");

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

    const brandName = file.destination
      .split("/")
      .pop()
      .replace("Tokens.swift", ""); // Extract brand name from the file path

    // Generate SwiftUI light colors
    const swiftUIColorBlock = dictionary.allProperties
      .filter((token) => !token.path[0].startsWith("color")) // Exclude primitive colors, only keep semantic tokens
      .map((token) => {
        let name = toCamelCase(token.path.slice(2).join("-")).replace(
          "Default",
          ""
        ); // Convert to camelCase, removing first two parts

        return `    var ${name}: Color { get }`;
      })
      .join("\n");

    // Generate UIKit light colors
    const uiColorBlock = dictionary.allProperties
      .filter((token) => !token.path[0].startsWith("color")) // Exclude primitive colors, only keep semantic tokens
      .map((token) => {
        let name = toCamelCase(token.path.slice(2).join("-")).replace(
          "Default",
          ""
        ); // Convert to camelCase, removing first two parts

        return `    var ${name}: UIColor { get }`;
      })
      .join("\n");

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

    const brandName = file.destination
      .split("/")
      .pop()
      .replace("Tokens.swift", ""); // Extract brand name from the file path

    // Generate SwiftUI light colors
    const swiftUIColorBlock = dictionary.allProperties
      .filter((token) => !token.path[0].startsWith("color")) // Exclude primitive colors, only keep semantic tokens
      .map((token) => {
        let name = toCamelCase(token.path.slice(2).join("-")).replace(
          "Default",
          ""
        ); // Convert to camelCase, removing first two parts
        let value = transformValue(token.original.value);

        return `    public var ${name}: Color { ${brandName.replace(
          /Dark|Light/g,
          ""
        )}${value} }`;
      })
      .join("\n");

    // Generate UIKit light colors
    const uiColorBlock = dictionary.allProperties
      .filter((token) => !token.path[0].startsWith("color")) // Exclude primitive colors, only keep semantic tokens
      .map((token) => {
        let name = toCamelCase(token.path.slice(2).join("-")).replace(
          "Default",
          ""
        ); // Convert to camelCase, removing first two parts
        let value = transformValue(token.original.value);

        return `    public var ${name}: UIColor { ${brandName.replace(
          /Dark|Light/g,
          ""
        )}UI${value} }`;
      })
      .join("\n");

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

    const brandName = file.destination
      .split("/")
      .pop()
      .replace("Colors.swift", ""); // Extract brand name from the file path

    // Generate SwiftUI colors
    const swiftUIColorBlock = dictionary.allProperties
      .filter((token) => !token.path[0].startsWith("color")) // Exclude primitive colors, only keep component colors
      .filter((token) => !token.path[1].startsWith("color")) // Exclude semantic tokens, only keep component colors
      .map((token) => {
        let name = toCamelCase(token.path.slice(1).join("-")).replace(
          "Default",
          ""
        ); // Convert to camelCase, removing first part
        let value = transformValue(token.original.value);

        return `    var ${name}: Color { ${brandName.replace(
          /Dark|Light/g,
          ""
        )}${value} }`;
      })
      .join("\n");

    // Generate UIKit colors
    const uiColorBlock = dictionary.allProperties
      .filter((token) => !token.path[0].startsWith("color")) // Exclude primitive colors, only keep component colors
      .filter((token) => !token.path[1].startsWith("color")) // Exclude semantic tokens, only keep component colors
      .map((token) => {
        let name = toCamelCase(token.path.slice(1).join("-")).replace(
          "Default",
          ""
        ); // Convert to camelCase, removing first part
        let value = transformValue(token.original.value);

        return `    var ${name}: UIColor { ${brandName.replace(
          /Dark|Light/g,
          ""
        )}UI${value} }`;
      })
      .join("\n");

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
