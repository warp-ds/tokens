import StyleDictionary from "style-dictionary";

// Custom transform to preserve hex values with alpha exactly as they appear in the JSON, without the "#" sign
StyleDictionary.registerTransform({
  name: 'color/hexAlpha',
  type: 'value',
  matcher: function(prop) {
    return prop.attributes.category === 'color';
  },
  transformer: function(prop) {
    return prop.value.startsWith('#') ? prop.value.slice(1) : prop.value; // Remove "#" if it exists
  }
});