var Interpol = {};

Interpol.Do = function(args) {
    if (!args) return false;
    if (!args.object) return false;
    if (!args.start) return false;
    if (!args.end) return false;
    if (!args.method) args.method = Interpol.Interpols.Lerp;
    if (!args.animController) args.animController = Interpol.AnimController;
    if (!args.time) args.time = 1e3;
    var beginAttribs = Interpol.Css.GetAllCssAttribs(args.start);
    var endAttribs = Interpol.Css.GetAllCssAttribs(args.end);
    var animController = new args.animController(args, beginAttribs, endAttribs);
    animController.Run();
    return true;
};

Interpol.Css = {};

Interpol.Css.GetCssAttrib = function(selector, attribute) {
    for (var i = 0; i < document.styleSheets.length; ++i) {
        var styleSheet = document.styleSheets[i];
        for (var j = 0; j < styleSheet.rules.length; ++j) {
            var rule = styleSheet.rules[j];
            if (selector.toLowerCase() === rule.selectorText.toLowerCase()) {
                return rule.style.getPropertyValue(attribute.toLowerCase());
            }
        }
    }
    return;
};

Interpol.Css.GetAllCssAttribs = function(selector) {
    var attribs = {};
    for (var i = 0; i < document.styleSheets.length; ++i) {
        var styleSheet = document.styleSheets[i];
        for (var j = 0; j < styleSheet.rules.length; ++j) {
            var rule = styleSheet.rules[j];
            if (selector.toLowerCase() === rule.selectorText.toLowerCase()) {
                var style = rule.style;
                for (var a = 0; a < style.length; ++a) {
                    var attribName = style.item(a);
                    attribs[attribName] = style.getPropertyValue(attribName.toLowerCase());
                }
            }
        }
    }
    return attribs;
};

Interpol.Css.IsAttribUnitPercent = function(attribute) {
    return attribute.charAt(attribute.length - 1) === "%";
};

Interpol.Css.IsAttribUnitPixel = function(attribute) {
    var subStr = attribute.substring(attribute.length - 2, attribute.length);
    if (subStr) {
        return subStr.toLowerCase() === "px";
    }
    return false;
};

Interpol.Css.GetAttribUnitStr = function(attribute) {
    if (Interpol.Css.IsAttribUnitPercent(attribute)) return "%"; else if (Interpol.Css.IsAttribUnitPixel(attribute)) return "px";
    return "";
};

Interpol.Css.IsAttribNumber = function(attribute) {
    return !isNaN(parseFloat(attribute));
};

Interpol.Interpols = {};

Interpol.Interpols.Lerp = function(x0, x1, t) {
    return (1 - t) * x0 + t * x1;
};

Interpol.Interpols.Sin = function(x0, x1, t) {
    t = Math.sin(Math.PI / 2 * t);
    return Interpol.Interpols.Lerp(x0, x1, t);
};

Interpol.Interpols.Cos = function(x0, x1, t) {
    t = Math.cos(Math.PI / 2 * t);
    return Interpol.Interpols.Lerp(x0, x1, t);
};

Interpol.Interpols.Smooth = function(x0, x1, t) {
    t = t * t * (3 - 2 * t);
    return Interpol.Interpols.Lerp(x0, x1, t);
};

Interpol.Interpols.Square = function(x0, x1, t) {
    t = t * t;
    return Interpol.Interpols.Lerp(x0, x1, t);
};

Interpol.Interpols.InvSquare = function(x0, x1, t) {
    var onemt = 1 - t;
    t = 1 - onemt * onemt;
    return Interpol.Interpols.Lerp(x0, x1, t);
};

Interpol.AnimController = function(args, beginAttribs, endAttribs) {
    this.args = args;
    this.beginAttribs = beginAttribs;
    this.endAttribs = endAttribs;
    this.animId = null;
    this.startTime = null;
    this.lastFrameTimestamp = null;
    this.timeSinceStart = null;
};

Interpol.AnimController.prototype.RequestAnimFrame = function() {
    var self = this;
    return requestAnimationFrame(function(ts) {
        self.DoFrame(ts);
    });
};

Interpol.AnimController.prototype.Run = function() {
    this.Setup();
    this.animId = this.RequestAnimFrame();
};

Interpol.AnimController.prototype.Setup = function() {
    this.numBeginAttribs = 0;
    for (var attribName in this.beginAttribs) {
        var attrib = this.beginAttribs[attribName];
        if (!Interpol.Css.IsAttribNumber(attrib)) {
            delete this.beginAttribs[attribName];
        }
        ++this.numBeginAttribs;
    }
    this.numEndAttribs = 0;
    for (var attribName in this.endAttribs) {
        var attrib = this.endAttribs[attribName];
        if (!Interpol.Css.IsAttribNumber(attrib)) {
            delete this.endAttribs[attribName];
        }
        ++this.numEndAttribs;
    }
};

Interpol.AnimController.prototype.DoFrame = function(timestamp) {
    if (this.startTime === null) this.startTime = timestamp;
    var animTimePassed = timestamp - this.startTime;
    if (animTimePassed > this.args.time) {
        this.OnFinish();
        return;
    }
    var t = animTimePassed / this.args.time;
    this.ApplyCss(t);
    this.RequestAnimFrame();
};

Interpol.AnimController.prototype.ApplyCss = function(t) {
    var attribs = this.numBeginAttribs > this.numEndAttribs ? this.beginAttribs : this.endAttribs;
    var otherAttribs = this.numBeginAttribs > this.numEndAttribs ? this.endAttribs : this.beginAttribs;
    for (var attribName in attribs) {
        if (otherAttribs[attribName] !== undefined) {
            if (Interpol.Css.GetAttribUnitStr(this.beginAttribs[attribName]) !== Interpol.Css.GetAttribUnitStr(this.endAttribs[attribName])) {
                console.log("Error, begin and end attributes have different units");
                continue;
            }
            var beginAttribVal = parseFloat(this.beginAttribs[attribName]);
            var endAttribVal = parseFloat(this.endAttribs[attribName]);
            var attribVal = this.args.method(beginAttribVal, endAttribVal, t);
            this.args.object.style.setProperty(attribName, attribVal + Interpol.Css.GetAttribUnitStr(this.beginAttribs[attribName]), "");
        } else console.log("Mismatching attributes!");
    }
};

Interpol.AnimController.prototype.OnFinish = function() {
    this.ApplyCss(1);
};