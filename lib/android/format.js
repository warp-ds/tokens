import StyleDictionary from "style-dictionary";
import { toCamelCase, transformValue, getGeneratedDate } from "./helpers.js";

// Register compose-colors-format for primitive colors
StyleDictionary.registerFormat({
  name: "compose-colors-format",
  formatter: function ({ dictionary, file, options }) {
    const brandName = file.destination
    .split("/")
    .pop()
    .replace("Colors.kt", ""); // Extract brand name from the file path
    if(brandName.startsWith("Dataviz")){
      return generateDatavizColorTokens(file, dictionary);
    } else {
      return generateColorTokens(file, dictionary);
    }
  },
});

StyleDictionary.registerFormat({
  name: "compose-colors-format-dark",
  formatter: function ({ dictionary, file, options }) {
    const brandName = file.destination
    .split("/")
    .pop()
    .replace("Colors.kt", ""); // Extract brand name from the file path
    if(brandName.startsWith("Dataviz")){
      return generateDatavizColorTokens(file, dictionary, true);
    } else {
      return generateColorTokens(file, dictionary, true);
    }
  },
});

function generateDatavizColorTokens(file, dictionary, isDark = false) {
   console.log(`Generating dataviz colors for ${file.destination}`);

  const brandName = file.destination
    .split("/")
    .pop()
    .replace("Colors.kt", ""); // Extract brand name from the file path

  const brandNameLowercase = brandName.charAt(0).toLowerCase() + brandName.slice(1).replace("Dark", "");

  var primitiveColorBlock = ``;
  if (!isDark) {
    // Generate Compose and XML colors based on the brand's primitive colors only for light mode
    primitiveColorBlock = dictionary.allProperties
      .filter((token) => token.path[0].startsWith("color"))
      .map((token) => {
        const nameParts = token.path.filter(
          (part) => part.toLowerCase() !== "color"
        );
        const name = nameParts
          .join("")
          .replace(/-/g, "") // Remove dashes and combine
          .replace(/^./, (char) => char.toUpperCase()); // Capitalize the first letter

        return `    internal val ${name} = Color(0xFF${token.value})`;
      })
      .join("\n");
  }

  const semanticColorBlockBackground = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("semantic")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(2).join("-")); // Convert to camelCase, removing first two parts

      if (name.startsWith("background")) {
        let tokenName = name.slice("background".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

    const semanticColorBlockLine = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("semantic")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(2).join("-")); // Convert to camelCase, removing first two parts

      if (name.startsWith("line")) {
        let tokenName = name.slice("line".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const semanticColorBlockBorder = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("semantic")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(2).join("-")); // Convert to camelCase, removing first two parts


      // Step 2: Only keep tokens starting with 'surface'
      if (name.startsWith("border")) {
        let tokenName = "" + name.slice("border".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const semanticColorBlockIcon = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("semantic")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(2).join("-")); // Convert to camelCase, removing first two parts


      // Step 2: Only keep tokens starting with 'surface'
      if (name.startsWith("icon")) {
        let tokenName = "" + name.slice("icon".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const semanticColorBlockText = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("semantic")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(2).join("-")); // Convert to camelCase, removing first two parts


      // Step 2: Only keep tokens starting with 'surface'
      if (name.startsWith("text")) {
        let tokenName = name.slice("text".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

    const semanticColorBlockChart = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("semantic")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(2).join("-")); // Convert to camelCase, removing first two parts


      // Step 2: Only keep tokens starting with 'chart'
      if (name.startsWith("chartline")) {
        let tokenName = name.slice("chartline".length);
        tokenName = tokenName.charAt(0) + tokenName.slice(1);

        return `    override val line${tokenName} = Color(0xFF${token.value})`;
      }
      if (name.startsWith("chartbackground")) {
        let tokenName = name.slice("chartbackground".length);
        tokenName = tokenName.charAt(0) + tokenName.slice(1);

        return `    override val background${tokenName} = Color(0xFF${token.value})`;
      }
      if (name.startsWith("charttext")) {
        let tokenName = name.slice("charttext".length);
        tokenName = tokenName.charAt(0) + tokenName.slice(1);

        return `    override val text${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  
  return `package com.schibsted.nmp.warp.theme.dataviz
import androidx.compose.ui.graphics.Color
import com.schibsted.nmp.warp.theme.WarpDatavizBackgroundColors
import com.schibsted.nmp.warp.theme.WarpDatavizBorderColors
import com.schibsted.nmp.warp.theme.WarpDatavizChartColors
import com.schibsted.nmp.warp.theme.WarpDatavizColors
import com.schibsted.nmp.warp.theme.WarpDatavizIconColors
import com.schibsted.nmp.warp.theme.WarpDatavizLineColors
import com.schibsted.nmp.warp.theme.WarpDatavizTextColors

// Generated on ${getGeneratedDate()} by https://github.com/warp-ds/tokens

object ${brandName}Colors : WarpDatavizColors {
    override val chart: WarpDatavizChartColors = ${brandName}ChartColors
    override val background: WarpDatavizBackgroundColors = ${brandName}BackgroundColors
    override val line: WarpDatavizLineColors = ${brandName}LineColors
    override val border: WarpDatavizBorderColors = ${brandName}BorderColors
    override val text: WarpDatavizTextColors = ${brandName}TextColors
    override val icon: WarpDatavizIconColors = ${brandName}IconColors
}

object ${brandName}ChartColors : WarpDatavizChartColors {
${semanticColorBlockChart}
}

object ${brandName}BackgroundColors : WarpDatavizBackgroundColors {
${semanticColorBlockBackground}
}

object ${brandName}LineColors : WarpDatavizLineColors {
${semanticColorBlockLine}
}

internal object ${brandName}BorderColors : WarpDatavizBorderColors {
${semanticColorBlockBorder}
}
   
internal object ${brandName}IconColors : WarpDatavizIconColors {
${semanticColorBlockIcon}
}

internal object ${brandName}TextColors : WarpDatavizTextColors {
${semanticColorBlockText}
}


${primitiveColorBlock}
`;
}

function generateColorTokens(file, dictionary, isDark = false) {
  // console.log(`Generating brand colors for ${file.destination}`);

  const brandName = file.destination
    .split("/")
    .pop()
    .replace("Colors.kt", ""); // Extract brand name from the file path

  const brandNameLowercase = brandName.charAt(0).toLowerCase() + brandName.slice(1).replace("Dark", "");

  var primitiveColorBlock = ``;
  var datavizColors = "DatavizDark";
  if (!isDark) {
    datavizColors = "Dataviz";
    // Generate Compose and XML colors based on the brand's primitive colors only for light mode
    primitiveColorBlock = dictionary.allProperties
      .filter((token) => token.path[0].startsWith("color"))
      .map((token) => {
        const nameParts = token.path.filter(
          (part) => part.toLowerCase() !== "color"
        );
        const name = nameParts
          .join("")
          .replace(/-/g, "") // Remove dashes and combine
          .replace(/^./, (char) => char.toUpperCase()); // Capitalize the first letter

        return `    internal val ${name} = Color(0xFF${token.value})`;
      })
      .join("\n");
  }

  const semanticColorBlockSurface = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("semantic")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(2).join("-")); // Convert to camelCase, removing first two parts

      if (name.startsWith("surface")) {
        let tokenName = name.slice("surface".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const semanticColorBlockBackground = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("semantic")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(2).join("-")); // Convert to camelCase, removing first two parts

      if (name.startsWith("background")) {
        let tokenName = name.slice("background".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const semanticColorBlockBorder = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("semantic")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(2).join("-")); // Convert to camelCase, removing first two parts


      // Step 2: Only keep tokens starting with 'surface'
      if (name.startsWith("border")) {
        let tokenName = "" + name.slice("border".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const semanticColorBlockIcon = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("semantic")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(2).join("-")); // Convert to camelCase, removing first two parts


      // Step 2: Only keep tokens starting with 'surface'
      if (name.startsWith("icon")) {
        let tokenName = "" + name.slice("icon".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const semanticColorBlockText = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("semantic")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(2).join("-")); // Convert to camelCase, removing first two parts


      // Step 2: Only keep tokens starting with 'surface'
      if (name.startsWith("text")) {
        let tokenName = name.slice("text".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const componentColorBlockButton = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("components")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(1).join("-")); // Convert to camelCase, removing first two parts

      if (name.startsWith("button")) {
        let tokenName = name.slice("button".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);


        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const componentColorBlockBadge = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("components")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(1).join("-")); // Convert to camelCase, removing first two parts

      if (name.startsWith("badge")) {
        let tokenName = name.slice("badge".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);


        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const componentColorBlockCallout = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("components")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(1).join("-")); // Convert to camelCase, removing first two parts

      if (name.startsWith("callout")) {
        let tokenName = name.slice("callout".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);


        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const componentColorBlockPill = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("components")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(1).join("-")); // Convert to camelCase, removing first two parts

      if (name.startsWith("pill")) {
        let tokenName = name.slice("pill".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const componentColorBlockNavbar = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("components")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(1).join("-")); // Convert to camelCase, removing first two parts

      if (name.startsWith("navbar")) {
        let tokenName = name.slice("navbar".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const componentColorBlockTooltip = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("components")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(1).join("-")); // Convert to camelCase, removing first two parts

      if (name.startsWith("tooltip")) {
        let tokenName = name.slice("tooltip".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const componentColorBlockSwitch = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("components")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(1).join("-")); // Convert to camelCase, removing first two parts

      if (name.startsWith("switch")) {
        let tokenName = name.slice("switch".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const componentColorBlockCard = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("components")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(1).join("-")); // Convert to camelCase, removing first two parts

      if (name.startsWith("card")) {
        let tokenName = name.slice("card".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");

  const componentColorBlockPageIndicator = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("components")) // Exclude primitive colors, only keep semantic tokens
    .map((token) => {
      let name = toCamelCase(token.path.slice(1).join("-")); // Convert to camelCase, removing first two parts

      if (name.startsWith("page")) {
        let tokenName = name.slice("page".length);
        tokenName = tokenName.charAt(0).toLowerCase() + tokenName.slice(1);

        return `    override val ${tokenName} = Color(0xFF${token.value})`;
      }
    })
    .filter(Boolean) // Remove any undefined values from the map step
    .join("\n");


  return `package com.schibsted.nmp.warp.brands.${brandNameLowercase}
import androidx.compose.ui.graphics.Color
import com.schibsted.nmp.warp.theme.*

// Generated on ${getGeneratedDate()} by https://github.com/warp-ds/tokens

internal object ${brandName}Colors : WarpColors {
    override val surface: WarpSurfaceColors = ${brandName}SurfaceColors
    override val background: WarpBackgroundColors = ${brandName}BackgroundColors
    override val border: WarpBorderColors = ${brandName}BorderColors
    override val icon: WarpIconColors = ${brandName}IconColors
    override val text: WarpTextColors = ${brandName}TextColors
    override val components: WarpComponentColors = ${brandName}ComponentColors
    override val dataviz: WarpDatavizColors = ${datavizColors}Colors
}

internal object ${brandName}SurfaceColors : WarpSurfaceColors {
${semanticColorBlockSurface}
}

internal object ${brandName}BackgroundColors : WarpBackgroundColors {
${semanticColorBlockBackground}
}

internal object ${brandName}BorderColors : WarpBorderColors {
${semanticColorBlockBorder}
}
   
internal object ${brandName}IconColors : WarpIconColors {
${semanticColorBlockIcon}
}

internal object ${brandName}TextColors : WarpTextColors {
${semanticColorBlockText}
}

internal object ${brandName}ComponentColors : WarpComponentColors {
    override val button: WarpButtonColors = ${brandName}ButtonColors
    override val badge: WarpBadgeColors = ${brandName}BadgeColors
    override val callout: WarpCalloutColors = ${brandName}CalloutColors
    override val pill: WarpPillColors = ${brandName}PillColors
    override val navBar: WarpNavBarColors = ${brandName}NavBarColors
    override val tooltip: WarpTooltipColors = ${brandName}TooltipColors
    override val switch: WarpSwitchColors = ${brandName}SwitchColors
    override val card: WarpCardColors = ${brandName}CardColors
    override val pageIndicator: WarpPageIndicatorColors = ${brandName}PageIndicatorColors
}

internal object ${brandName}ButtonColors : WarpButtonColors {
${componentColorBlockButton}
}

internal object ${brandName}BadgeColors : WarpBadgeColors {
${componentColorBlockBadge}
}

internal object ${brandName}CalloutColors : WarpCalloutColors {
${componentColorBlockCallout}
}

internal object ${brandName}PillColors : WarpPillColors {
${componentColorBlockPill}
}

internal object ${brandName}NavBarColors : WarpNavBarColors {
${componentColorBlockNavbar}
}

internal object ${brandName}TooltipColors : WarpTooltipColors {
${componentColorBlockTooltip}
}

private object ${brandName}SwitchColors : WarpSwitchColors {
${componentColorBlockSwitch}
}

private object ${brandName}CardColors : WarpCardColors {
${componentColorBlockCard}
}

private object ${brandName}PageIndicatorColors : WarpPageIndicatorColors {
${componentColorBlockPageIndicator}
}
${primitiveColorBlock}
`;
}


// Register colors-xml-format for generating colors.xml file
StyleDictionary.registerFormat({
  name: "colors-xml-format",
  formatter: function ({ dictionary, file, options }) {
    const brandName = file.brand
    
    console.log( brandName);
    if(brandName.startsWith("dataviz")){
      return generateDatavizColorsXml(dictionary);
    } else {
    return generateColorsXml(dictionary);
    }
  },
});

function generateDatavizColorsXml(dictionary) {
   console.log("Generating dataviz colors.xml file");

  const header = `<?xml version="1.0" encoding="utf-8"?>
<resources>`;
  const colorsSemantic = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("semantic"))
    .map((token) => {
      const nameParts = token.path.slice(2) // Get path excluding "color"
      const name = nameParts
        .map((part) => part.replace(/-/g, "_").toLowerCase())
        .join("_");


      return `   <color name="warp_dataviz_${name}">${token.value}</color>`;
    })
    .join("\n");

  const footer = `</resources>`;

  return `${header}\n
  <!--*** SEMANTIC DATAVIZ COLORS ***-->\n
${colorsSemantic}\n
${footer}`;
}

function generateColorsXml(dictionary) {
  // console.log("Generating colors.xml file");

  const header = `<?xml version="1.0" encoding="utf-8"?>
<resources>`;

  const colorEntries = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("color"))
    .map((token) => {
      const nameParts = token.path.slice(1); // Get path excluding "color"
      const name = nameParts
        .map((part) => part.replace(/_/g, "").replace(/-/g, "").toLowerCase())
        .join("_");

      return `    <color name="${name}">${token.value}</color>`;
    })
    .join("\n");

  const colorsSemantic = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("semantic"))
    .map((token) => {
      const nameParts = token.path.slice(2) // Get path excluding "color"
      const name = nameParts
        .map((part) => part.replace(/-/g, "_").toLowerCase())
        .join("_");


      return `   <color name="warp_${name}">${token.value}</color>`;
    })
    .join("\n");

  const colorsComponents = dictionary.allProperties
    .filter((token) => token.path[0].startsWith("components"))
    .map((token) => {
      const nameParts = token.path.slice(1) // Get path excluding "color"
      const name = nameParts
        .map((part) => part.replace(/-/g, "_").replace(/ /g, "_").toLowerCase())
        .join("_");


      return `   <color name="warp_${name}">${token.value}</color>`;
    })
    .join("\n");

  const footer = `</resources>`;

  return `${header}\n
  <!--*** SEMANTIC COLORS ***-->\n
${colorsSemantic}\n
  <!--*** COMPONENT COLORS ***-->\n
${colorsComponents}\n  
  <!--*** PRIMITIVE COLORS ***-->\n
${colorEntries}\n
${footer}`;
}

StyleDictionary.registerFormat({
  name: "colors-ids-xml-format",
  formatter: function ({ dictionary, file, options }) {

    const header = `<?xml version="1.0" encoding="utf-8"?>
<resources>`;

    const idEntriesComponents = dictionary.allProperties
      .filter((token) => !token.path[0].startsWith("color"))
      .filter((token) => !token.path[0].startsWith("semantic"))
      .map((token) => {
        const nameParts = token.path.slice(1); // Get path excluding "color"
        const name = nameParts
          .map((part) => part.replace(/ /g, "_").replace(/-/g, "_").toLowerCase())
          .join("_");

        return `    <id name="warp_${name}" type="color" />`;
      })
      .join("\n");

      const idEntriesSemantic = dictionary.allProperties
      .filter((token) => !token.path[0].startsWith("color"))
      .filter((token) => !token.path[0].startsWith("components"))
      .map((token) => {
        const nameParts = token.path.slice(2); // Get path excluding "color"
        const name = nameParts
          .map((part) => part.replace(/ /g, "_").replace(/-/g, "_").toLowerCase())
          .join("_");

        return `    <id name="warp_${name}" type="color" />`;
      })
      .join("\n");
    const footer = `</resources>`;
    return `${header}\n
  <!--*** SEMANTIC COLORS ***-->\n
${idEntriesSemantic}\n
  <!--*** COMPONENT COLORS ***-->\n
${idEntriesComponents}\n
${footer}`;
  },
});