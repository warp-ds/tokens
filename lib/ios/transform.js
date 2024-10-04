import StyleDictionary from "style-dictionary";

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