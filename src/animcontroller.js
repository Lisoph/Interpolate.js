window.requestAnimationFrame = (function() {
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame  ||
	window.mozRequestAnimationFrame     ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

/* AnimController class */
Interpol.AnimController = function(args, beginAttribs, endAttribs) {
	this.args = args;
	this.beginAttribs = beginAttribs;
	this.endAttribs = endAttribs;

	this.animId = null;

	this.startTime = null;
	this.lastFrameTimestamp = null;
	this.timeSinceStart = null;

	this.registeredAttribControllers = [];
}

Interpol.AnimController.prototype.HasAttribController = function(attribName) {
	for(var index in this.registeredAttribControllers) {
		var registeredAttribController = this.registeredAttribControllers[index];

		if(registeredAttribController.attribName === attribName) {
			return true;
		}
	}

	return false;
}

Interpol.AnimController.prototype.GetAttribController = function(attribName) {
	for(var index in this.registeredAttribControllers) {
		var registeredAttribController = this.registeredAttribControllers[index];

		if(registeredAttribController.attribName === attribName) {
			return registeredAttribController.controller;
		}
	}

	return undefined;
}

Interpol.AnimController.prototype.RegisterAttribController = function(attribName, attribController) {
	if(this.HasAttribController(attribName)) {
		console.log("Attribute controller for " + attribName + " already registered!");
		return;
	}

	this.registeredAttribControllers.push({ attribName: attribName, controller: attribController });
}

Interpol.AnimController.prototype.RequestAnimFrame = function() {
	var self = this;

	return window.requestAnimationFrame(function(ts) { self.DoFrame(ts); });
}

Interpol.AnimController.prototype.Run = function() {
	/* Register default attribute controllers */
	this.RegisterAttribController("background-color", new Interpol.AttribControllers.ColorAttribController(this.args, "background-color"));
	this.RegisterAttribController("color", new Interpol.AttribControllers.ColorAttribController(this.args, "color"));

	this.Setup();
	this.animId = this.RequestAnimFrame();
}

Interpol.AnimController.prototype.Setup = function() {
	/* Throw out all non-number attributes in begin- & endAttributes */
	/* Except attributes that have a registered attribute controller */

	this.numBeginAttribs = 0;
	for(var attribName in this.beginAttribs) {
		/* Ignore attribute with a registered attribute controller */
		if(this.HasAttribController(attribName)) {
			continue;
		}

		var attrib = this.beginAttribs[attribName];

		if(!Interpol.Css.IsAttribNumber(attrib)) {
			delete this.beginAttribs[attribName];
		}

		++this.numBeginAttribs;
	}

	this.numEndAttribs = 0;
	for(var attribName in this.endAttribs) {
		/* Ignore attribute with a registered attribute controller */
		if(this.HasAttribController(attribName)) {
			continue;
		}

		var attrib = this.endAttribs[attribName];

		if(!Interpol.Css.IsAttribNumber(attrib)) {
			delete this.endAttribs[attribName];
		}

		++this.numEndAttribs;
	}

	/*console.log(this.beginAttribs);
	console.log(this.endAttribs);*/
}

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
}

Interpol.AnimController.prototype.ApplyCss = function(t) {
	var self = this;

	/* Iterate over whatever attrib object has more attributes */
	var attribs = (this.numBeginAttribs > this.numEndAttribs ? this.beginAttribs : this.endAttribs);
	var otherAttribs = (this.numBeginAttribs > this.numEndAttribs ? this.endAttribs : this.beginAttribs);

	for(var attribName in attribs) {
		// console.log("Doing attribute " + attribName);

		/* Check if otherAttribs has that attribute too */
		if(otherAttribs[attribName] !== undefined) {

			/* Check if there is a registered attribute controller for this attribute */
			if(self.HasAttribController(attribName)) {
				var controller = self.GetAttribController(attribName);
				controller.Do(self.beginAttribs[attribName], self.endAttribs[attribName], t);
			}

			/* Ok, so no attribute controller was found. Now we're guessing that the attribute is a number. */
			/* Check if both values have the same unit */
			else if(Interpol.Css.GetAttribUnitStr(this.beginAttribs[attribName]) === Interpol.Css.GetAttribUnitStr(this.endAttribs[attribName])) {
				var beginAttribVal = parseFloat(this.beginAttribs[attribName]);
				var endAttribVal = parseFloat(this.endAttribs[attribName]);
				var attribVal = this.args.method(beginAttribVal, endAttribVal, t);

				this.args.object.style.setProperty(attribName, attribVal + Interpol.Css.GetAttribUnitStr(this.beginAttribs[attribName]), "");
			}
			else {
				// console.log("Error, begin and end attributes have different units");
				console.log("Error: Attribute '" + attriName + "': Neither was a attribute controller found, nor is the attribute a number with equal units!");
				// continue;
			}
		}
		else console.log("Mismatching attributes!");
	}
}

Interpol.AnimController.prototype.OnFinish = function() {
	/* This guarantees a perfect end state */
	this.ApplyCss(1.0);

	if(this.args.callbacks.onFinish)
		this.args.callbacks.onFinish();
}