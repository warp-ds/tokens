export function getBrandName(file, strToReplace) {
  return file.destination.split("/").pop().replace(strToReplace, ""); // Extract brand name from the file path
}

export function transformValue(value) {
  // Remove curly braces and split by dots
  let parts = value.replace("{", "").replace("}", "").split(".");

  // Replace 'color' with 'Colors' and uppercase the first letter of the first part
  if (parts[0].toLowerCase() === "color") {
    parts[0] = "Colors";
  } else {
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }

  // Remove the second dot (combine the second and third parts, if they exist)
  if (parts.length > 2) {
    parts[1] = parts[1] + parts[2]; // Combine the second and third parts
    parts.splice(2, 1); // Remove the third part (dot removal)
  }

  // Join the parts back together with a dot
  return parts.join(".");
}

// Helper function to convert dashed and lowercased names to camelCase
export function toCamelCase(str) {
  return str
    .replace(" ", "-")
    .split(/[-_.]/g) // Split by dashes or underscores or dot
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    ) // Capitalize the first letter of every word except the first
    .join(""); // Join the words together to form a camelCase string
}

// Helper function to extract tokens from file content
export function extractTokens(fileContent, type) {
  const tokenPattern = new RegExp(`.*var (.+?): ${type} { (.+?) }`, "g");
  const tokens = {};
  let match;
  while ((match = tokenPattern.exec(fileContent)) !== null) {
    tokens[match[1]] = match[2]; // Capture token name and value
  }
  return tokens;
}

// Helper function to get the current date in the desired format
export function getGeneratedDate() {
  const now = new Date();
  return now.toUTCString();  // Generates a string like: Fri, 11 Oct 2024 10:19:17 GMT
}