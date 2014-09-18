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

window.requestAnimationFrame = function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
        window.setTimeout(callback, 1e3 / 60);
    };
}();

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
    return window.requestAnimationFrame(function(ts) {
        self.DoFrame(ts);
    });
};

Interpol.AnimController.prototype.Run = function() {
    this.RegisterAttribController("background-color", new Interpol.AttribControllers.ColorAttribController(this.args, "background-color"));
    this.RegisterAttribController("color", new Interpol.AttribControllers.ColorAttribController(this.args, "color"));
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
                controller.Do(self.beginAttribs[attribName], self.endAttribs[attribName], t);
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

String.prototype.IsNumeric = function() {
    return !isNaN(this);
};

Interpol.StrUtils.BuildRgbaStr = function(r, g, b, a) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
};

Interpol.StrUtils.IsHex = function(str) {
    str = str.trim();
    return str.charAt(0) === "#" && (str.length - 1) % 3 == 0;
};

Interpol.StrUtils.HexToRgba = function(str, alpha) {
    str.trim();
    if (!this.IsHex(str)) return undefined;
    str = str.substr(1);
    var val = parseInt(str, 16);
    var r = val >> 24;
    var g = val >> 16 & 255;
    var b = val >> 8 & 255;
    if (typeof alpha == "undefined") alpha = 1;
    return this.BuildRgbaStr(r, g, b, alpha);
};

Interpol.StrUtils.IsRgb = function(str) {
    str.trim();
    if (str.substr(0, 4) !== "rgb(") return false;
    return true;
};

Interpol.StrUtils.RgbToRgba = function(str, alpha) {
    if (!this.IsRgb(str)) return undefined;
    str = str.replace(" ", "");
    var strIndex = 4;
    var numStr = "";
    var digit;
    while ((digit = str.substr(strIndex, 1)).IsNumeric()) {
        numStr += digit.toString();
        ++strIndex;
    }
    var r = parseInt(numStr);
    if (isNaN(r)) return undefined;
    numStr = "";
    ++strIndex;
    while ((digit = str.substr(strIndex, 1)).IsNumeric()) {
        numStr += digit.toString();
        ++strIndex;
    }
    var g = parseInt(numStr);
    if (isNaN(g)) return undefined;
    numStr = "";
    ++strIndex;
    while ((digit = str.substr(strIndex, 1)).IsNumeric()) {
        numStr += digit.toString();
        ++strIndex;
    }
    var b = parseInt(numStr);
    if (isNaN(b)) return undefined;
    numStr = "";
    if (typeof alpha == "undefined") alpha = 1;
    return this.BuildRgbaStr(r, g, b, alpha);
};

Interpol.StrUtils.ToRgba = function(str, alpha) {
    return this.IsRgba(str) ? str : this.HexToRgba(str, alpha) || this.RgbToRgba(str, alpha) || undefined;
};

Interpol.StrUtils.IsRgba = function(str) {
    str.trim();
    if (str.substr(0, 5) !== "rgba(") return false;
    return true;
};

Interpol.StrUtils.RgbaToColor = function(str) {
    str = str.replace(" ", "");
    var strIndex = 5;
    var numStr = "";
    var digit;
    while ((digit = str.substr(strIndex, 1)).IsNumeric()) {
        numStr += digit.toString();
        ++strIndex;
    }
    var r = parseInt(numStr);
    if (isNaN(r)) return undefined;
    numStr = "";
    ++strIndex;
    while ((digit = str.substr(strIndex, 1)).IsNumeric()) {
        numStr += digit.toString();
        ++strIndex;
    }
    var g = parseInt(numStr);
    if (isNaN(g)) return undefined;
    numStr = "";
    ++strIndex;
    while ((digit = str.substr(strIndex, 1)).IsNumeric()) {
        numStr += digit.toString();
        ++strIndex;
    }
    var b = parseInt(numStr);
    if (isNaN(b)) return undefined;
    numStr = "";
    ++strIndex;
    while ((digit = str.substr(strIndex, 1)).IsNumeric() || digit === ".") {
        numStr += digit.toString();
        ++strIndex;
    }
    var a = parseFloat(numStr);
    if (isNaN(a)) return undefined;
    numStr = "";
    return {
        r: r,
        g: g,
        b: b,
        a: a
    };
};

Interpol.AttribControllers = {};

Interpol.AttribControllers.ColorAttribController = function(args, attribName) {
    this.args = args;
    this.attribName = attribName;
};

Interpol.AttribControllers.ColorAttribController.prototype.Do = function(beginAttrib, endAttrib, t) {
    var self = this;
    beginAttrib = Interpol.StrUtils.ToRgba(beginAttrib);
    endAttrib = Interpol.StrUtils.ToRgba(endAttrib);
    var beginColor = Interpol.StrUtils.RgbaToColor(beginAttrib);
    var endColor = Interpol.StrUtils.RgbaToColor(endAttrib);
    var color = {
        r: parseInt(self.args.method(beginColor.r, endColor.r, t)),
        g: parseInt(self.args.method(beginColor.g, endColor.g, t)),
        b: parseInt(self.args.method(beginColor.b, endColor.b, t)),
        a: self.args.method(beginColor.a, endColor.a, t)
    };
    this.args.object.style[this.attribName] = Interpol.StrUtils.BuildRgbaStr(color.r, color.g, color.b, color.a);
};