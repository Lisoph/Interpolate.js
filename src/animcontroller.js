/* AnimController class */
Interpol.AnimController = function(args, beginAttribs, endAttribs) {
	this.args = args;
	this.beginAttribs = beginAttribs;
	this.endAttribs = endAttribs;

	this.animId = null;

	this.startTime = null;
	this.lastFrameTimestamp = null;
	this.timeSinceStart = null;
}

Interpol.AnimController.prototype.RequestAnimFrame = function() {
	//return requestAnimationFrame(this.DoFrame.bind(this));

	var self = this;
	return requestAnimationFrame(function(ts) { self.DoFrame(ts); });
}

Interpol.AnimController.prototype.Run = function() {
	this.Setup();
	this.animId = this.RequestAnimFrame();
}

Interpol.AnimController.prototype.Setup = function() {
	/* Throw out all non-number attributes in begin- & endAttributes */

	this.numBeginAttribs = 0;
	for(var attribName in this.beginAttribs) {
		var attrib = this.beginAttribs[attribName];

		if(!Interpol.Css.IsAttribNumber(attrib)) {
			delete this.beginAttribs[attribName];
		}

		++this.numBeginAttribs;
	}

	this.numEndAttribs = 0;
	for(var attribName in this.endAttribs) {
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
	/* Iterate over whatever attrib object has more attributes */
	var attribs = (this.numBeginAttribs > this.numEndAttribs ? this.beginAttribs : this.endAttribs);
	var otherAttribs = (this.numBeginAttribs > this.numEndAttribs ? this.endAttribs : this.beginAttribs);

	for(var attribName in attribs) {
		// console.log("Doing attribute " + attribName);

		/* Check if otherAttribs has that attribute too */
		if(otherAttribs[attribName] !== undefined) {
			/* Check if both values have the same unit */
			if(Interpol.Css.GetAttribUnitStr(this.beginAttribs[attribName]) !== Interpol.Css.GetAttribUnitStr(this.endAttribs[attribName])) {
				console.log("Error, begin and end attributes have different units");
				continue;
			}

			var beginAttribVal = parseFloat(this.beginAttribs[attribName]);
			var endAttribVal = parseFloat(this.endAttribs[attribName]);
			var attribVal = this.args.method(beginAttribVal, endAttribVal, t);

			this.args.object.style.setProperty(attribName, attribVal + Interpol.Css.GetAttribUnitStr(this.beginAttribs[attribName]), "");
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