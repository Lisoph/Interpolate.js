Interpol.Css = {};

/*
 * GetCssProperty - Returns the $property of the css $selector
*/
Interpol.Css.GetCssProperty = function(selector, property) {
	/* Loop trough all style sheets */
	for(var i = 0; i < document.styleSheets.length; ++i) {
		var styleSheet = document.styleSheets[i];

		/* Loop trough all style sheet rules */
		for(var j = 0; j < styleSheet.rules.length; ++j) {
			var rule = styleSheet.rules[j];

			/* Return the property $property, if the rule with the selector $selector was found */
			if(selector.toLowerCase() === rule.selectorText.toLowerCase()) {
				return rule.style.getPropertyValue(property.toLowerCase());
			}
		}
	}

	return undefined;
};

Interpol.Css.GetAllCssProperties = function(selector) {
	var properties = {};

	/* Loop trough all style sheets */
	for(var i = 0; i < document.styleSheets.length; ++i) {
		var styleSheet = document.styleSheets[i];

		/* Loop trough all style sheet rules */
		for(var j = 0; j < styleSheet.rules.length; ++j) {
			var rule = styleSheet.rules[j];

			if(selector.toLowerCase() === rule.selectorText.toLowerCase()) {
				var style = rule.style;

				/* Loop trough all properties */
				for(var a = 0; a < style.length; ++a) {
					var propertyName = style.item(a);
					properties[propertyName] = style.getPropertyValue(propertyName.toLowerCase());
				}
			}
		}
	}

	return properties;
};

Interpol.Css.IsPropertyUnitPercent = function(property) {
	return property.charAt(property.length - 1) === '%';
};

Interpol.Css.IsPropertyUnitPixel = function(property) {
	var subStr = property.substring(property.length - 2, property.length);
	if(subStr) {
		return subStr.toLowerCase() === "px";
	}

	return false;
};

Interpol.Css.GetPropertyUnitStr = function(property) {
	if(Interpol.Css.IsPropertyUnitPercent(property))
		return "%";
	else if(Interpol.Css.IsPropertyUnitPixel(property))
		return "px";
	return "";
};

Interpol.Css.IsPropertyNumber = function(property) {
	return !isNaN(parseFloat(property));
};