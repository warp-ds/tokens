import fs from "fs";
import path from "path";
import { supportedBrandNames } from "./utils.js";

// Go through all component and semantic tokens in all modes
export function processAndWriteSemanticAndComponentTokens(
	sourceData,
	tokenVariableCollection,
) {
	// Extract modes and variables from sourceData
	// Example: "FINN Light", "FINN dark", "Dataviz Light"
	const modes =
		sourceData.meta.variableCollections[tokenVariableCollection].modes;
	const supportedModes = modes.filter((mode) =>
		supportedBrandNames.some((brand) =>
			mode.name.toLowerCase().includes(brand),
		),
	);

	const variables = sourceData.meta.variables;

	// Initialize objects for each mode
	const modeObjects = supportedModes.reduce((acc, mode) => {
		const isDataviz = mode.name.toLowerCase().includes("dataviz");
		if (isDataviz) {
			acc[mode.name] = { modeId: mode.modeId, semantic: {} };
		} else {
			acc[mode.name] = { modeId: mode.modeId, semantic: {}, components: {} };
		}
		return acc;
	}, {});

	// Process tokens for each mode
	// Only use the VariableCollection that contains component and semantic tokens
	sourceData.meta.variableCollections[
		tokenVariableCollection
	].variableIds.forEach((variableId) => {
		// get the data for the specific component or semantic token
		const variable = variables[variableId];
		if (variable && variable.resolvedType === "COLOR") {
			const tokenType = variable.name.startsWith("Components")
				? "components"
				: "semantic";
			Object.values(modeObjects).forEach((modeObject) => {
				// Get the name of the token the variable refers to, for example "DBA/Gray/200" or "Semantic/Background/Disabled"
				// Transforms it to the desired format with brackets and dot notation, for example "{color.gray.200}"
				const value = extractValueForMode(
					variable,
					modeObject.modeId,
					sourceData,
				);

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

	// Enrich the semantic tokens with -static and -inverted-static variants for all text and icon tokens
	for (const [brandAndMode, values] of Object.entries(modeObjects)) {
		/** @type {["FINN" | "Tori" | "DBA" | "Blocket" | "Neutral" | "Vend", "light" | "dark"]} */
		const [brand, mode] = brandAndMode.split(" ");

		// default and inverted are handled by `static` and `inverted-static` straight from Figma
		const semanticTextTokens = [
			"subtle",
			"placeholder",
			"inverted-subtle",
			"link",
			"disabled",
			"negative",
			"positive",
		];
		const semanticIconTokens = [
			"hover",
			"active",
			"selected",
			"selected-hover",
			"selected-active",
			"disabled",
			"subtle",
			"subtle-hover",
			"subtle-active",
			"inverted-hover",
			"inverted-active",
			"primary",
			"secondary",
			"secondary-hover",
			"secondary-active",
			"positive",
			"negative",
			"warning",
			"info",
			"notification",
		];

		for (const variant of semanticTextTokens) {
			// Generate a <variant>-static with the same value as light-mode <variant> (f. ex link)
			// and a inverted-<variant>-static with the same value as the dark-mode <variant>
			const variantStaticValue = modeObjects[`${brand} light`].semantic.color.text[variant];
			if (!variantStaticValue) {
				console.error(`Didn't find a value for ${variant}-static`);
			} else {
				modeObjects[`${brand} ${mode}`].semantic.color.text[`${variant}-static`] = variantStaticValue;
			}
			const invertedVariantStaticValue = modeObjects[`${brand} dark`].semantic.color.text[variant];
			if (!invertedVariantStaticValue) {
				console.error(`Didn't find a value for inverted-${variant}-static`);
			} else {
				modeObjects[`${brand} ${mode}`].semantic.color.text[`inverted-${variant}-static`] = invertedVariantStaticValue;
			}
		}
		
		for (const variant of semanticIconTokens) {
			// Generate a <variant>-static with the same value as light-mode <variant> (f. ex link)
			// and a inverted-<variant>-static with the same value as the dark-mode <variant>
			const variantStaticValue = modeObjects[`${brand} light`].semantic.color.icon[variant];
			if (!variantStaticValue) {
				console.error(`Didn't find a value for ${variant}-static`);
			} else {
				modeObjects[`${brand} ${mode}`].semantic.color.icon[`${variant}-static`] = variantStaticValue;
			}
			const invertedVariantStaticValue = modeObjects[`${brand} dark`].semantic.color.icon[variant];
			if (!invertedVariantStaticValue) {
				console.error(`Didn't find a value for inverted-${variant}-static`);
			} else {
				modeObjects[`${brand} ${mode}`].semantic.color.icon[`inverted-${variant}-static`] = invertedVariantStaticValue;
			}
		}
	}

	// Write the files for each mode
	Object.entries(modeObjects).map(([modeName, modeObject]) => {
		const dirPath = `tokens/${modeName.toLowerCase().replace(" ", "-")}`;
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
		}
		fs.writeFileSync(
			path.join(dirPath, "semantic.json"),
			JSON.stringify({ semantic: modeObject.semantic }, null, 2),
		);

		if (modeObject.components) {
			fs.writeFileSync(
				path.join(dirPath, "components.json"),
				JSON.stringify({ components: modeObject.components }, null, 2),
			);
		}
	});
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
