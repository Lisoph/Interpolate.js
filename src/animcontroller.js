window.requestAnimationFrame = (function() {
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame  ||
	window.mozRequestAnimationFrame     ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

/* AnimController class */
Interpol.AnimController = function(args, beginProperties, endProperties) {
	this.args = args;
	this.beginProperties = beginProperties;
	this.endProperties = endProperties;

	this.animId = null;

	this.startTime = null;
	this.lastFrameTimestamp = null;
	this.timeSinceStart = null;

	this.registeredPropertyControllers = [];
};

Interpol.AnimController.prototype.HasPropertyController = function(propertyName) {
	for(var index in this.registeredPropertyControllers) {
		var registeredPropertyController = this.registeredPropertyControllers[index];

		if(registeredPropertyController.propertyName === propertyName) {
			return true;
		}
	}

	return false;
};

Interpol.AnimController.prototype.GetPropertyController = function(propertyName) {
	for(var index in this.registeredPropertyControllers) {
		var registeredPropertyController = this.registeredPropertyControllers[index];

		if(registeredPropertyController.propertyName === propertyName) {
			return registeredPropertyController.controller;
		}
	}

	return undefined;
};

Interpol.AnimController.prototype.RegisterPropertyController = function(propertyName, propertyController) {
	if(this.HasPropertyController(propertyName)) {
		console.log("Property controller for " + propertyName + " already registered!");
		return;
	}

	this.registeredPropertyControllers.push({ propertyName: propertyName, controller: propertyController });
};

Interpol.AnimController.prototype.RequestAnimFrame = function() {
	var self = this;

	return window.requestAnimationFrame(function(ts) { self.DoFrame(ts); });
};

Interpol.AnimController.prototype.Run = function() {
	/* Register default property controllers */
	this.RegisterPropertyController("background-color", new Interpol.PropertyControllers.ColorPropertyController(this.args, "background-color"));
	this.RegisterPropertyController("color", new Interpol.PropertyControllers.ColorPropertyController(this.args, "color"));

	this.Setup();
	this.animId = this.RequestAnimFrame();
};

Interpol.AnimController.prototype.Setup = function() {
	/* Throw out all non-number properties in begin- & endProperties */
	/* Except proeprties that have a registered property controller */

	var propertyName;
	var property;

	this.numBeginProperties = 0;
	for(propertyName in this.beginProperties) {
		/* Ignore property with a registered property controller */
		if(this.HasPropertyController(propertyName)) {
			continue;
		}

		property = this.beginProperties[propertyName];

		if(!Interpol.Css.IsPropertyNumber(property)) {
			delete this.beginProperties[propertyName];
		}

		++this.numBeginProperties;
	}

	this.numEndProperties = 0;
	for(propertyName in this.endProperties) {
		/* Ignore property with a registered property controller */
		if(this.HasPropertyController(propertyName)) {
			continue;
		}

		property = this.endProperties[propertyName];

		if(!Interpol.Css.IsPropertyNumber(property)) {
			delete this.endProperties[propertyName];
		}

		++this.numEndProperties;
	}
};

Interpol.AnimController.prototype.DoFrame = function(timestamp) {
	if(this.startTime === null) this.startTime = timestamp;

	var animTimePassed = timestamp - this.startTime;
	if(animTimePassed > this.args.time) {
		this.OnFinish();
		return; // We're done
	}

	var t = animTimePassed / this.args.time;
	this.ApplyCss(t);

	if(this.args.callbacks.onProgress)
		this.args.callbacks.onProgress(t);

	this.RequestAnimFrame();
};

Interpol.AnimController.prototype.ApplyCss = function(t) {
	var self = this;

	/* Iterate over whatever property object has more properties */
	var properties = (this.numBeginProperties > this.numEndProperties ? this.beginProperties : this.endProperties);
	var otherProperties = (this.numBeginProperties > this.numEndProperties ? this.endProperties : this.beginProperties);

	for(var propertyName in properties) {
		/* Check if otherProperties has that property too */
		if(otherProperties[propertyName] !== undefined) {

			/* Check if there is a registered property controller for this property */
			if(self.HasPropertyController(propertyName)) {
				var controller = self.GetPropertyController(propertyName);
				controller.Do(self.beginProperties[propertyName], self.endProperties[propertyName], t);
			}

			/* Ok, so no property controller was found. Now we're guessing that the property is a number. */
			/* Check if both values have the same unit */
			else if(Interpol.Css.GetPropertyUnitStr(this.beginProperties[propertyName]) === Interpol.Css.GetPropertyUnitStr(this.endProperties[propertyName])) {
				var beginPropertyVal = parseFloat(this.beginProperties[propertyName]);
				var endPropertyVal = parseFloat(this.endProperties[propertyName]);
				var propertyVal = this.args.method(beginPropertyVal, endPropertyVal, t);

				this.args.object.style.setProperty(propertyName, propertyVal + Interpol.Css.GetPropertyUnitStr(this.beginProperties[propertyName]), "");
			}
			else {
				console.log("Error: Property '" + propertyName + "': Neither was a property controller found, nor is the property a number with consistent units!");
			}
		}
		else console.log("Mismatching properties!");
	}
};

Interpol.AnimController.prototype.OnFinish = function() {
	/* This guarantees a perfect end state */
	this.ApplyCss(1.0);

	if(this.args.callbacks.onFinish)
		this.args.callbacks.onFinish();
};