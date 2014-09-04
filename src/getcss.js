Interpol.Css = {};

/*
 * GetCssAttrib - Returns the $attribute of the css $selector
*/
Interpol.Css.GetCssAttrib = function(selector, attribute) {
	/* Loop trough all style sheets */
	for(var i = 0; i < document.styleSheets.length; ++i) {
		var styleSheet = document.styleSheets[i];

		/* Loop trough all style sheet rules */
		for(var j = 0; j < styleSheet.rules.length; ++j) {
			var rule = styleSheet.rules[j];

			/* Return the attribute _attribute_, if the rule with the selector _selector_ was found */
			if(selector.toLowerCase() === rule.selectorText.toLowerCase()) {
				//return rule.style[attribute.toLowerCase()];
				return rule.style.getPropertyValue(attribute.toLowerCase());
			}
		}
	}

	return; // This returns undefined
}

Interpol.Css.GetAllCssAttribs = function(selector) {
	var attribs = {};

	/* Loop trough all style sheets */
	for(var i = 0; i < document.styleSheets.length; ++i) {
		var styleSheet = document.styleSheets[i];

		/* Loop trough all style sheet rules */
		for(var j = 0; j < styleSheet.rules.length; ++j) {
			var rule = styleSheet.rules[j];

			if(selector.toLowerCase() === rule.selectorText.toLowerCase()) {
				var style = rule.style;

				/* Loop trough all attributes */
				for(var a = 0; a < style.length; ++a) {
					var attribName = style.item(a);
					// attribs[attribName] = style.getAttribValue(attribName);
					attribs[attribName] = style.getPropertyValue(attribName.toLowerCase());
				}
			}
		}
	}

	return attribs;
}

Interpol.Css.IsAttribUnitPercent = function(attribute) {
	return attribute.charAt(attribute.length - 1) === '%';
}

Interpol.Css.IsAttribUnitPixel = function(attribute) {
	var subStr = attribute.substring(attribute.length - 2, attribute.length);
	if(subStr) {
		return subStr.toLowerCase() === "px";
	}

	return false;
}

Interpol.Css.GetAttribUnitStr = function(attribute) {
	if(Interpol.Css.IsAttribUnitPercent(attribute))
		return "%";
	else if(Interpol.Css.IsAttribUnitPixel(attribute))
		return "px";
	return "";
}

Interpol.Css.IsAttribNumber = function(attribute) {
	return !isNaN(/*parseInt*/parseFloat(attribute));
}