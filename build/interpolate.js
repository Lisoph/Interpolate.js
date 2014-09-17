var Interpol = {};

Interpol.Do = function(args) {
    if (!args) return false;
    if (!args.object) return false;
    if (!args.start) return false;
    if (!args.end) return false;
    if (!args.method) args.method = Interpol.Methods.Lerp;
    if (!args.animController) args.animController = Interpol.AnimController;
    if (!args.time) args.time = 1e3;
    if (!args.callbacks) args.callbacks = {};
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

Interpol.Methods = {};

Interpol.Methods.Lerp = function(x0, x1, t) {
    return (1 - t) * x0 + t * x1;
};

Interpol.Methods.Sin = function(x0, x1, t) {
    t = Math.sin(Math.PI / 2 * t);
    return Interpol.Methods.Lerp(x0, x1, t);
};

Interpol.Methods.Smooth = function(x0, x1, t) {
    t = t * t * (3 - 2 * t);
    return Interpol.Methods.Lerp(x0, x1, t);
};

Interpol.Methods.Square = function(x0, x1, t) {
    t = t * t;
    return Interpol.Methods.Lerp(x0, x1, t);
};

Interpol.Methods.InvSquare = function(x0, x1, t) {
    var invt = 1 - t;
    t = 1 - invt * invt;
    return Interpol.Methods.Lerp(x0, x1, t);
};

Interpol.AnimController = function(args, beginAttribs, endAttribs) {
    this.args = args;
    this.beginAttribs = beginAttribs;
    this.endAttribs = endAttribs;
    this.animId = null;
    this.startTime = null;
    this.lastFrameTimestamp = null;
    this.timeSinceStart = null;
    this.registeredAttribControllers = [];
};

Interpol.AnimController.prototype.HasAttribController = function(attribName) {
    for (var index in this.registeredAttribControllers) {
        var registeredAttribController = this.registeredAttribControllers[index];
        if (registeredAttribController.attribName === attribName) {
            return true;
        }
    }
    return false;
};

Interpol.AnimController.prototype.GetAttribController = function(attribName) {
    for (var index in this.registeredAttribControllers) {
        var registeredAttribController = this.registeredAttribControllers[index];
        if (registeredAttribController.attribName === attribName) {
            return registeredAttribController.controller;
        }
    }
    return undefined;
};

Interpol.AnimController.prototype.RegisterAttribController = function(attribName, attribController) {
    if (this.HasAttribController(attribName)) {
        console.log("Attribute controller for " + attribName + " already registered!");
        return;
    }
    this.registeredAttribControllers.push({
        attribName: attribName,
        controller: attribController
    });
};

Interpol.AnimController.prototype.RequestAnimFrame = function() {
    var self = this;
    return requestAnimationFrame(function(ts) {
        self.DoFrame(ts);
    });
};

Interpol.AnimController.prototype.Run = function() {
    this.RegisterAttribController("background-color", new Interpol.AttribControllers.BackgroundColorAttribController(this.args.object));
    this.Setup();
    this.animId = this.RequestAnimFrame();
};

Interpol.AnimController.prototype.Setup = function() {
    this.numBeginAttribs = 0;
    for (var attribName in this.beginAttribs) {
        if (this.HasAttribController(attribName)) {
            continue;
        }
        var attrib = this.beginAttribs[attribName];
        if (!Interpol.Css.IsAttribNumber(attrib)) {
            delete this.beginAttribs[attribName];
        }
        ++this.numBeginAttribs;
    }
    this.numEndAttribs = 0;
    for (var attribName in this.endAttribs) {
        if (this.HasAttribController(attribName)) {
            continue;
        }
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
    if (this.args.callbacks.onProgress) this.args.callbacks.onProgress(t);
    this.RequestAnimFrame();
};

Interpol.AnimController.prototype.ApplyCss = function(t) {
    var self = this;
    var attribs = this.numBeginAttribs > this.numEndAttribs ? this.beginAttribs : this.endAttribs;
    var otherAttribs = this.numBeginAttribs > this.numEndAttribs ? this.endAttribs : this.beginAttribs;
    for (var attribName in attribs) {
        if (otherAttribs[attribName] !== undefined) {
            if (self.HasAttribController(attribName)) {
                var controller = self.GetAttribController(attribName);
                controller.Do(self.beginAttribs[attribName], self.endAttribs[attribName]);
            } else if (Interpol.Css.GetAttribUnitStr(this.beginAttribs[attribName]) === Interpol.Css.GetAttribUnitStr(this.endAttribs[attribName])) {
                var beginAttribVal = parseFloat(this.beginAttribs[attribName]);
                var endAttribVal = parseFloat(this.endAttribs[attribName]);
                var attribVal = this.args.method(beginAttribVal, endAttribVal, t);
                this.args.object.style.setProperty(attribName, attribVal + Interpol.Css.GetAttribUnitStr(this.beginAttribs[attribName]), "");
            } else {
                console.log("Error: Attribute '" + attriName + "': Neither was a attribute controller found, nor is the attribute a number with equal units!");
            }
        } else console.log("Mismatching attributes!");
    }
};

Interpol.AnimController.prototype.OnFinish = function() {
    this.ApplyCss(1);
    if (this.args.callbacks.onFinish) this.args.callbacks.onFinish();
};

Interpol.StrUtils = {};

String.prototype.Contains = function(str) {
    return this.indexOf(str) !== -1;
};

Interpol.AttribControllers = {};

Interpol.AttribControllers.BackgroundColorAttribController = function(object) {
    this.object = object;
};

Interpol.AttribControllers.BackgroundColorAttribController.prototype.Do = function(beginProperty, endProperty) {
    this.object.style.backgroundColor = "orange";
};