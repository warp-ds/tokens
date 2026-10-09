import StyleDictionary from "style-dictionary";
import fs from "fs";
import fsExtra from "fs-extra";
import path from "path";
import "./lib/ios/transform.js";
import "./lib/ios/format.js";
import { extractTokens, toCamelCase } from "./lib/helpers.js";

const tokensPath = "./tokens";
const iosFolder = "output/ios/"; // Folder for iOS
const iosBrandsFolder = "output/ios/Brands/"; // Folder for iOS brand colors
const iosTokensFolder = "output/ios/Tokens/"; // Folder for iOS tokens

// Function to generate iOS-specific primitive colors for each brand
function generateColorsForIOS(uniqueBrands) {
	uniqueBrands.forEach((brand) => {
		//console.log(`Processing colors for brand: ${brand}`);

		const tokenFilePath = path.join(
			tokensPath,
			`${brand}-light`,
			"colors.json",
		);

		// Check if colors.json exists before proceeding
		if (!fs.existsSync(tokenFilePath)) {
			console.error(`colors.json not found for ${brand}`);
			return; // Skip this brand if colors.json does not exist
		}

		try {
			/** @type {import('style-dictionary').Config} */
			const iosConfig = {
				source: [tokenFilePath],
				platforms: {
					ios: {
						transformGroup: "ios-swift",
						buildPath: iosBrandsFolder, // Trailing slash ensures correct file paths
						files: [
							{
								destination: `${
									brand.charAt(0).toUpperCase() + brand.slice(1)
								}Colors.swift`,
								format: "combined-swiftui-uikit-color-format",
								className: `${
									brand.charAt(0).toUpperCase() + brand.slice(1)
								}Colors`,
								options: {
									fileHeader: "warpHeaderMessage",
								},
							},
						],
						transforms: [
							"attribute/cti",
							"name/cti/pascal",
							"color/ios/hexAlpha",
						], // Use custom hexAlpha transform
					},
				},
			};

			const sd = StyleDictionary.extend(iosConfig);
			sd.buildPlatform("ios");
			/* console.log(
        `Successfully built iOS primitive colors for ${brand} in ${outputFolder}`
      ); */
		} catch (error) {
			console.error(
				`Error building iOS primitive colors for ${brand}: ${error.message}`,
			);
		}
	});
}

// Function to generate iOS-specific TokenProvider
function generateTokenProviderForIOS(uniqueBrands) {
	uniqueBrands.forEach((brand) => {
		// console.log(`Processing tokens for TokenProvider`);

		const lightTokenFilePath = path.join(
			tokensPath,
			`${brand}-light`,
			"semantic.json",
		);
		const colorFilePath = path.join(
			tokensPath,
			`${brand}-light`,
			"colors.json",
		); // Load the color file for reference resolution

		// Skip this brand if semantic.json files or colors.json are missing
		if (!fs.existsSync(lightTokenFilePath) || !fs.existsSync(colorFilePath)) {
			console.error(`semantic.json or colors.json not found for ${brand}`);
			return; // Skip this brand if semantic.json or colors.json doesn't exist
		}

		try {
			// console.log(`Reading light token file: ${lightTokenFilePath}`);
			const lightTokens = JSON.parse(fs.readFileSync(lightTokenFilePath));
			// console.log(`Reading colors file: ${colorFilePath}`);
			const colorTokens = JSON.parse(fs.readFileSync(colorFilePath));

			/** @type {import('style-dictionary').Config} */
			const iosTokensConfig = {
				source: [lightTokenFilePath, colorFilePath], // Include colors.json in source to resolve references
				platforms: {
					ios: {
						transformGroup: "ios-swift",
						buildPath: iosTokensFolder,
						files: [
							{
								destination: `TokenProvider.swift`,
								format: "token-provider-swift-format",
								className: `TokenProvider`,
								options: {
									fileHeader: "warpHeaderMessage",
								},
							},
						],
						transforms: [
							"attribute/cti",
							"name/cti/pascal",
							"color/ios/hexAlpha",
						],
					},
				},
			};

			const sdTokens = StyleDictionary.extend(iosTokensConfig);
			sdTokens.buildPlatform("ios");
			/* console.log(
        `Successfully built iOS tokens for ${brand} in ${iosTokensFolder}`
      ); */
		} catch (error) {
			console.error(`Error building iOS tokens for ${brand}: ${error.message}`);
		}
	});
}

// Function to generate iOS-specific light tokens for each brand
function generateLightTokensForIOS(uniqueBrands) {
	uniqueBrands.forEach((brand) => {
		// console.log(`Processing tokens for brand: ${brand}`);

		const lightTokenFilePath = path.join(
			tokensPath,
			`${brand}-light`,
			"semantic.json",
		);
		const colorFilePath = path.join(
			tokensPath,
			`${brand}-light`,
			"colors.json",
		); // Load the color file for reference resolution

		// Skip this brand if semantic.json files or colors.json are missing
		if (!fs.existsSync(lightTokenFilePath) || !fs.existsSync(colorFilePath)) {
			console.error(`semantic.json or colors.json not found for ${brand}`);
			return; // Skip this brand if semantic.json or colors.json doesn't exist
		}

		try {
			// console.log(`Reading light token file: ${lightTokenFilePath}`);
			const lightTokens = JSON.parse(fs.readFileSync(lightTokenFilePath));
			// console.log(`Reading colors file: ${colorFilePath}`);
			const colorTokens = JSON.parse(fs.readFileSync(colorFilePath));

			/** @type {import('style-dictionary').Config} */
			const iosTokensConfig = {
				source: [lightTokenFilePath, colorFilePath], // Include colors.json in source to resolve references
				platforms: {
					ios: {
						transformGroup: "ios-swift",
						buildPath: iosTokensFolder,
						files: [
							{
								destination: `${
									brand.charAt(0).toUpperCase() + brand.slice(1)
								}LightTokens.swift`,
								format: "tokens-swift-format",
								className: `${
									brand.charAt(0).toUpperCase() + brand.slice(1)
								}LightTokens`,
								options: {
									fileHeader: "warpHeaderMessage",
								},
							},
						],
						transforms: [
							"attribute/cti",
							"name/cti/pascal",
							"color/ios/hexAlpha",
						],
					},
				},
			};

			const sdTokens = StyleDictionary.extend(iosTokensConfig);
			sdTokens.buildPlatform("ios");
			/* console.log(
        `Successfully built iOS tokens for ${brand} in ${iosTokensFolder}`
      ); */
		} catch (error) {
			console.error(`Error building iOS tokens for ${brand}: ${error.message}`);
		}
	});
}

// Function to generate iOS-specific dark tokens for each brand
function generateDarkTokensForIOS(uniqueBrands) {
	uniqueBrands.forEach((brand) => {
		// console.log(`Processing tokens for brand: ${brand}`);

		const darkTokenFilePath = path.join(
			tokensPath,
			`${brand}-dark`,
			"semantic.json",
		);
		const colorFilePath = path.join(
			tokensPath,
			`${brand}-light`,
			"colors.json",
		); // Load the color file for reference resolution

		// Skip this brand if semantic.json files or colors.json are missing
		if (!fs.existsSync(darkTokenFilePath) || !fs.existsSync(colorFilePath)) {
			console.error(`semantic.json or colors.json not found for ${brand}`);
			return; // Skip this brand if semantic.json or colors.json doesn't exist
		}

		try {
			// console.log(`Reading dark token file: ${darkTokenFilePath}`);
			const darkTokens = JSON.parse(fs.readFileSync(darkTokenFilePath));
			// console.log(`Reading colors file: ${colorFilePath}`);
			const colorTokens = JSON.parse(fs.readFileSync(colorFilePath));

			/** @type {import('style-dictionary').Config} */
			const iosTokensConfig = {
				source: [darkTokenFilePath, colorFilePath], // Include colors.json in source to resolve references
				platforms: {
					ios: {
						transformGroup: "ios-swift",
						buildPath: iosTokensFolder,
						files: [
							{
								destination: `${
									brand.charAt(0).toUpperCase() + brand.slice(1)
								}DarkTokens.swift`,
								format: "tokens-swift-format",
								className: `${
									brand.charAt(0).toUpperCase() + brand.slice(1)
								}DarkTokens`,
								options: {
									fileHeader: "warpHeaderMessage",
								},
							},
						],
						transforms: [
							"attribute/cti",
							"name/cti/pascal",
							"color/ios/hexAlpha",
						],
					},
				},
			};

			const sdTokens = StyleDictionary.extend(iosTokensConfig);
			sdTokens.buildPlatform("ios");
			/* console.log(
        `Successfully built iOS tokens for ${brand} in ${iosTokensFolder}`
      ); */
		} catch (error) {
			console.error(`Error building iOS tokens for ${brand}: ${error.message}`);
		}
	});
}

// Function to generate iOS-specific light colors for each brand
function generateLightColorsForIOS(uniqueBrands) {
	uniqueBrands.forEach((brand) => {
		// console.log(`Processing colors for brand: ${brand}`);

		const lightColorFilePath = path.join(
			tokensPath,
			`${brand}-light`,
			"components.json",
		);
		const lightTokenFilePath = path.join(
			tokensPath,
			`${brand}-light`,
			"semantic.json",
		);
		const colorFilePath = path.join(
			tokensPath,
			`${brand}-light`,
			"colors.json",
		); // Load the color file for reference resolution

		// Skip this brand if components.json or semantic.json or colors.json files are missing
		if (
			!fs.existsSync(lightColorFilePath) ||
			!fs.existsSync(lightTokenFilePath) ||
			!fs.existsSync(colorFilePath)
		) {
			console.error(
				`components.json or semantic.json or colors.json not found for ${brand}`,
			);
			return; // Skip this brand if components.json or semantic.json or colors.json doesn't exist
		}

		try {
			// console.log(`Reading light color file: ${lightColorFilePath}`);
			const lightColors = JSON.parse(fs.readFileSync(lightColorFilePath));
			// console.log(`Reading light token file: ${lightTokenFilePath}`);
			const lightTokens = JSON.parse(fs.readFileSync(lightTokenFilePath));
			// console.log(`Reading colors file: ${colorFilePath}`);
			const colorTokens = JSON.parse(fs.readFileSync(colorFilePath));

			/** @type {import('style-dictionary').Config} */
			const iosColorsConfig = {
				source: [lightColorFilePath, lightTokenFilePath, colorFilePath], // Include colors.json in source to resolve references
				platforms: {
					ios: {
						transformGroup: "ios-swift",
						buildPath: iosFolder,
						files: [
							{
								destination: `${
									brand.charAt(0).toUpperCase() + brand.slice(1)
								}LightColors.swift`,
								format: "colors-swift-format",
								className: `${
									brand.charAt(0).toUpperCase() + brand.slice(1)
								}LightColors`,
								options: {
									fileHeader: "warpHeaderMessage",
								},
							},
						],
						transforms: [
							"attribute/cti",
							"name/cti/pascal",
							"color/ios/hexAlpha",
						],
					},
				},
			};

			const sdTokens = StyleDictionary.extend(iosColorsConfig);
			sdTokens.buildPlatform("ios");
			// console.log(`Successfully built iOS colors for ${brand} in ${iosFolder}`);
		} catch (error) {
			console.error(`Error building iOS colors for ${brand}: ${error.message}`);
		}
	});
}

// Function to generate iOS-specific dark colors for each brand
function generateDarkColorsForIOS(uniqueBrands) {
	uniqueBrands.forEach((brand) => {
		// console.log(`Processing colors for brand: ${brand}`);

		const darkColorFilePath = path.join(
			tokensPath,
			`${brand}-dark`,
			"components.json",
		);
		const darkTokenFilePath = path.join(
			tokensPath,
			`${brand}-dark`,
			"semantic.json",
		);
		const colorFilePath = path.join(tokensPath, `${brand}-dark`, "colors.json"); // Load the color file for reference resolution

		// Skip this brand if semantic.json or semantic.json or colors.json files are missing
		if (
			!fs.existsSync(darkColorFilePath) ||
			!fs.existsSync(darkTokenFilePath) ||
			!fs.existsSync(colorFilePath)
		) {
			console.error(
				`components.json or semantic.json or colors.json not found for ${brand}`,
			);
			return; // Skip this brand if components.json or semantic.json or colors.json doesn't exist
		}

		try {
			// console.log(`Reading dark color file: ${darkColorFilePath}`);
			const darkColors = JSON.parse(fs.readFileSync(darkColorFilePath));
			// console.log(`Reading dark token file: ${darkTokenFilePath}`);
			const darkTokens = JSON.parse(fs.readFileSync(darkTokenFilePath));
			// console.log(`Reading colors file: ${colorFilePath}`);
			const colorTokens = JSON.parse(fs.readFileSync(colorFilePath));

			/** @type {import('style-dictionary').Config} */
			const iosColorsConfig = {
				source: [darkColorFilePath, darkTokenFilePath, colorFilePath], // Include colors.json in source to resolve references
				platforms: {
					ios: {
						transformGroup: "ios-swift",
						buildPath: iosFolder,
						files: [
							{
								destination: `${
									brand.charAt(0).toUpperCase() + brand.slice(1)
								}DarkColors.swift`,
								format: "colors-swift-format",
								className: `${
									brand.charAt(0).toUpperCase() + brand.slice(1)
								}DarkColors`,
								options: {
									fileHeader: "warpHeaderMessage",
								},
							},
						],
						transforms: [
							"attribute/cti",
							"name/cti/pascal",
							"color/ios/hexAlpha",
						],
					},
				},
			};

			const sdTokens = StyleDictionary.extend(iosColorsConfig);
			sdTokens.buildPlatform("ios");
			// console.log(`Successfully built iOS colors for ${brand} in ${iosFolder}`);
		} catch (error) {
			console.error(`Error building iOS colors for ${brand}: ${error.message}`);
		}
	});
}

// Function to combine LightTokens and DarkTokens files (both SwiftUI and UIKit)
function combineTokenProviders() {
	// Log all the files inside the folder
	const allFiles = fs.readdirSync(iosTokensFolder);
	// console.log(`Files in ${iosTokensFolder}:`, allFiles);

	// Filter the files that end with LightTokens.swift
	const tokenFiles = allFiles.filter((file) =>
		file.endsWith("LightTokens.swift"),
	);

	// Log how many files were found
	/* console.log(
    `Found ${tokenFiles.length} LightTokens files in ${iosTokensFolder}`
  ); */

	tokenFiles.forEach((lightFile) => {
		const brandName = lightFile.replace("LightTokens.swift", ""); // Extract the brand name
		const darkFile = `${brandName}DarkTokens.swift`; // Corresponding dark token provider file

		const lightFilePath = path.join(iosTokensFolder, lightFile);
		const darkFilePath = path.join(iosTokensFolder, darkFile);

		// console.log(`Processing brand for Tokens: ${brandName}`);
		// console.log(`Light file: ${lightFilePath}`);
		// console.log(`Dark file: ${darkFilePath}`);

		if (fs.existsSync(lightFilePath) && fs.existsSync(darkFilePath)) {
			// Read the contents of both files
			const lightFileContent = fs.readFileSync(lightFilePath, "utf8");
			const darkFileContent = fs.readFileSync(darkFilePath, "utf8");

			// Log the contents of the light and dark token provider files
			// console.log(`Light File Content:\n${lightFileContent}`);
			// console.log(`Dark File Content:\n${darkFileContent}`);

			// Parse the SwiftUI and UIKit properties from each file
			const lightTokens = extractTokens(lightFileContent, "Color");
			const darkTokens = extractTokens(darkFileContent, "Color");
			const lightUITokens = extractTokens(lightFileContent, "UIColor");
			const darkUITokens = extractTokens(darkFileContent, "UIColor");

			// Combine the SwiftUI tokens into a single output
			const combinedSwiftUITokens = Object.keys(lightTokens)
				.map((token) => {
					const lightValue = lightTokens[token];
					const darkValue = darkTokens[token];
					return `    public var ${token}: Color = Color.dynamicColor(defaultColor: ${lightValue}, darkModeColor: ${darkValue})`;
				})
				.join("\n");

			// Combine the UIKit tokens into a single output
			const combinedUITokens = Object.keys(lightUITokens)
				.map((token) => {
					const lightValue = lightUITokens[token];
					const darkValue = darkUITokens[token];
					return `    public var ${token}: UIColor = UIColor.dynamicColor(defaultColor: ${lightValue}, darkModeColor: ${darkValue})`;
				})
				.join("\n");

			let combinedContent = "";

			if (brandName.includes("Dataviz")) {
				// Generate the combined file content
				combinedContent = `import SwiftUI

// Generated by https://github.com/warp-ds/tokens, do not edit
public struct ${brandName}TokenProvider {
${combinedSwiftUITokens}
}

public struct ${brandName}UITokenProvider {
${combinedUITokens}
}
`;
			} else {
				// Generate the combined file content
				combinedContent = `import SwiftUI

// Generated by https://github.com/warp-ds/tokens, do not edit
struct ${brandName}TokenProvider: TokenProvider {
${combinedSwiftUITokens}
}

struct ${brandName}UITokenProvider: UITokenProvider {
${combinedUITokens}
}
`;
			}

			// Write the combined content to a new file
			const combinedFilePath = path.join(
				iosTokensFolder,
				`${brandName}Tokens.swift`,
			);
			fs.writeFileSync(combinedFilePath, combinedContent, "utf8");
			// console.log(`Combined token provider created for ${brandName}`);

			// Delete the original Light and Dark token files
			fs.unlinkSync(lightFilePath);
			fs.unlinkSync(darkFilePath);
			// console.log(`Deleted ${lightFile} and ${darkFile}`);
		} else {
			console.error(`Missing light or dark file for brand: ${brandName}`);
		}
	});
}

// Function to combine light and dark color providers from all brands into a single ColorProvider.swift file
function combineAllColorProviders() {
	const allFiles = fs.readdirSync(iosFolder);

	const lightFiles = allFiles.filter((file) =>
		file.endsWith("LightColors.swift"),
	);

	// brandColorValues[brand][token] = valueExpression
	const brandColorValues = {};
	const brandUIColorValues = {};
	let tokenOrder = null; // preserve order from first brand processed

	lightFiles.forEach((lightFile) => {
		const brandName = lightFile.replace("LightColors.swift", "");
		const darkFile = `${brandName}DarkColors.swift`;

		const lightFilePath = path.join(iosFolder, lightFile);
		const darkFilePath = path.join(iosFolder, darkFile);

		if (fs.existsSync(lightFilePath) && fs.existsSync(darkFilePath)) {
			const lightFileContent = fs.readFileSync(lightFilePath, "utf8");
			const darkFileContent = fs.readFileSync(darkFilePath, "utf8");

			const lightTokens = extractTokens(lightFileContent, "Color");
			const darkTokens = extractTokens(darkFileContent, "Color");
			const lightUITokens = extractTokens(lightFileContent, "UIColor");
			const darkUITokens = extractTokens(darkFileContent, "UIColor");

			if (!tokenOrder) {
				tokenOrder = Object.keys(lightTokens);
			}

			brandColorValues[brandName] = {};
			Object.keys(lightTokens).forEach((token) => {
				const lightValue = lightTokens[token];
				const darkValue = darkTokens[token];

				if (lightValue.includes("Semantic") && darkValue.includes("Semantic")) {
					const camelCasedLightToken = toCamelCase(
						lightValue
							.replace(`${brandName}Semantic.color`, "")
							.replace(".default", ""),
					);

					if (lightValue === darkValue) {
						brandColorValues[brandName][token] = `token.${camelCasedLightToken}`;
					} else {
						const camelCasedDarkToken = toCamelCase(
							darkValue
								.replace(`${brandName}Semantic.color`, "")
								.replace(".default", ""),
						);
						brandColorValues[brandName][token] = `Color.dynamicColor(defaultColor: token.${camelCasedLightToken}, darkModeColor: token.${camelCasedDarkToken})`;
					}
				} else if (lightValue === darkValue) {
					brandColorValues[brandName][token] = lightValue;
				} else {
					brandColorValues[brandName][token] = `Color.dynamicColor(defaultColor: ${lightValue}, darkModeColor: ${darkValue})`;
				}
			});

			brandUIColorValues[brandName] = {};
			Object.keys(lightUITokens).forEach((token) => {
				const lightValue = lightUITokens[token];
				const darkValue = darkUITokens[token];

				if (lightValue.includes("Semantic") && darkValue.includes("Semantic")) {
					const camelCasedLightToken = toCamelCase(
						lightValue
							.replace(`${brandName}UISemantic.color`, "")
							.replace(".default", ""),
					);

					if (lightValue === darkValue) {
						brandUIColorValues[brandName][token] = `token.${camelCasedLightToken}`;
					} else {
						const camelCasedDarkToken = toCamelCase(
							darkValue
								.replace(`${brandName}UISemantic.color`, "")
								.replace(".default", ""),
						);
						brandUIColorValues[brandName][token] = `UIColor.dynamicColor(defaultColor: token.${camelCasedLightToken}, darkModeColor: token.${camelCasedDarkToken})`;
					}
				} else if (lightValue === darkValue) {
					brandUIColorValues[brandName][token] = lightValue;
				} else {
					brandUIColorValues[brandName][token] = `UIColor.dynamicColor(defaultColor: ${lightValue}, darkModeColor: ${darkValue})`;
				}
			});
		} else {
			console.error(`Missing light or dark file for brand: ${brandName}`);
		}
	});

	const brands = Object.keys(brandColorValues);
	const tokens = tokenOrder || [];
	const uiTokens = brands.length > 0 ? Object.keys(brandUIColorValues[brands[0]] || {}) : [];

	const propertyDecls = tokens
		.map((t) => `    public var ${t}: Color`)
		.join("\n");

	const uiPropertyDecls = uiTokens
		.map((t) => `    public var ${t}: UIColor`)
		.join("\n");

	const initCases = brands
		.map((brand) => {
			const assignments = tokens
				.map((t) => `            ${t} = ${brandColorValues[brand][t]}`)
				.join("\n");
			return `        case .${brand.toLowerCase()}:\n${assignments}`;
		})
		.join("\n");

	const uiInitCases = brands
		.map((brand) => {
			const assignments = uiTokens
				.map((t) => `            ${t} = ${brandUIColorValues[brand][t]}`)
				.join("\n");
			return `        case .${brand.toLowerCase()}:\n${assignments}`;
		})
		.join("\n");

	const combinedContent = `import SwiftUI

// Generated by https://github.com/warp-ds/tokens, do not edit
public struct ColorProvider {
    public let token: TokenProvider
${propertyDecls}

    public init(token: TokenProvider) {
        self.token = token
        switch Warp.Theme {
${initCases}
        }
    }
}

public struct UIColorProvider {
    public let token: UITokenProvider
${uiPropertyDecls}

    public init(token: UITokenProvider) {
        self.token = token
        switch Warp.Theme {
${uiInitCases}
        }
    }
}
`;

	const combinedFilePath = path.join(iosFolder, `ColorProvider.swift`);
	fs.writeFileSync(combinedFilePath, combinedContent, "utf8");

	// Delete the original Light and Dark color provider files
	lightFiles.forEach((lightFile) => {
		const darkFile = lightFile.replace("Light", "Dark");
		const lightFilePath = path.join(iosFolder, lightFile);
		const darkFilePath = path.join(iosFolder, darkFile);

		fs.unlinkSync(lightFilePath);
		fs.unlinkSync(darkFilePath);
	});
}

export const processIos = () => {
	fsExtra.ensureDirSync(iosFolder);
	fsExtra.ensureDirSync(iosBrandsFolder);
	fsExtra.ensureDirSync(iosTokensFolder);
	const brandModes = fs
		.readdirSync(tokensPath)
		.filter((item) => fs.statSync(path.join(tokensPath, item)).isDirectory());

	// Create a set to track unique brand names (e.g., 'finn', 'blocket')
	const uniqueBrands = new Set(
		brandModes.map((brandMode) => brandMode.split("-")[0]),
	);
	// First generate the colors for iOS (Brand Colors)
	generateColorsForIOS(uniqueBrands);

	// Then generate token provider for iOS
	generateTokenProviderForIOS(uniqueBrands);

	// Then generate the light tokens for iOS
	generateLightTokensForIOS(uniqueBrands);

	// Then generate the dark tokens for iOS
	generateDarkTokensForIOS(uniqueBrands);

	// Then generate the light colors for iOS
	generateLightColorsForIOS(uniqueBrands);

	// Then generate the dark colors for iOS
	generateDarkColorsForIOS(uniqueBrands);

	// Combine the LightTokenProvider and DarkTokenProvider files
	combineTokenProviders();

	// Combine the LightColorProvider and DarkColorProvider files for all brands
	combineAllColorProviders();
};
