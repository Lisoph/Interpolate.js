var Interpol = {};

Interpol.Do = function(args) {
    if (typeof args == "undefined") return false;
    if (typeof args.object == "undefined") return false;
    if (typeof args.start == "undefined") return false;
    if (typeof args.end == "undefined") return false;
    if (typeof args.method == "undefined") args.method = Interpol.Methods.Lerp;
    if (typeof args.animController == "undefined") args.animController = Interpol.AnimController;
    if (typeof args.time == "undefined") args.time = 1e3;
    if (typeof args.callbacks == "undefined") args.callbacks = {};
    if (typeof args.reverse == "undefined") args.reverse = false;
    if (args.reverse) {
        var tmp = args.start;
        args.start = args.end;
        args.end = tmp;
    }
    var beginProperties = Interpol.Css.GetAllCssProperties(args.start);
    var endProperties = Interpol.Css.GetAllCssProperties(args.end);
    var animController = new args.animController(args, beginProperties, endProperties);
    animController.Run();
    return true;
};

Interpol.Css = {};

Interpol.Css.GetCssProperty = function(selector, property) {
    for (var i = 0; i < document.styleSheets.length; ++i) {
        var styleSheet = document.styleSheets[i];
        for (var j = 0; j < styleSheet.rules.length; ++j) {
            var rule = styleSheet.rules[j];
            if (selector.toLowerCase() === rule.selectorText.toLowerCase()) {
                return rule.style.getPropertyValue(property.toLowerCase());
            }
        }
    }
    return undefined;
};

Interpol.Css.GetAllCssProperties = function(selector) {
    var properties = {};
    for (var i = 0; i < document.styleSheets.length; ++i) {
        var styleSheet = document.styleSheets[i];
        for (var j = 0; j < styleSheet.rules.length; ++j) {
            var rule = styleSheet.rules[j];
            if (selector.toLowerCase() === rule.selectorText.toLowerCase()) {
                var style = rule.style;
                for (var a = 0; a < style.length; ++a) {
                    var propertyName = style.item(a);
                    properties[propertyName] = style.getPropertyValue(propertyName.toLowerCase());
                }
            }
        }
    }
    return properties;
};

Interpol.Css.IsPropertyUnitPercent = function(property) {
    return property.charAt(property.length - 1) === "%";
};

Interpol.Css.IsPropertyUnitPixel = function(property) {
    var subStr = property.substring(property.length - 2, property.length);
    if (subStr) {
        return subStr.toLowerCase() === "px";
    }
    return false;
};

Interpol.Css.GetPropertyUnitStr = function(property) {
    if (Interpol.Css.IsPropertyUnitPercent(property)) return "%"; else if (Interpol.Css.IsPropertyUnitPixel(property)) return "px";
    return "";
};

Interpol.Css.IsPropertyNumber = function(property) {
    return !isNaN(parseFloat(property));
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
    for (var index in this.registeredPropertyControllers) {
        var registeredPropertyController = this.registeredPropertyControllers[index];
        if (registeredPropertyController.propertyName === propertyName) {
            return true;
        }
    }
    return false;
};

Interpol.AnimController.prototype.GetPropertyController = function(propertyName) {
    for (var index in this.registeredPropertyControllers) {
        var registeredPropertyController = this.registeredPropertyControllers[index];
        if (registeredPropertyController.propertyName === propertyName) {
            return registeredPropertyController.controller;
        }
    }
    return undefined;
};

Interpol.AnimController.prototype.RegisterPropertyController = function(propertyName, propertyController) {
    if (this.HasPropertyController(propertyName)) {
        console.log("Property controller for " + propertyName + " already registered!");
        return;
    }
    this.registeredPropertyControllers.push({
        propertyName: propertyName,
        controller: propertyController
    });
};

Interpol.AnimController.prototype.RequestAnimFrame = function() {
    var self = this;
    return window.requestAnimationFrame(function(ts) {
        self.DoFrame(ts);
    });
};

Interpol.AnimController.prototype.Run = function() {
    this.RegisterPropertyController("background-color", new Interpol.PropertyControllers.ColorPropertyController(this.args, "background-color"));
    this.RegisterPropertyController("color", new Interpol.PropertyControllers.ColorPropertyController(this.args, "color"));
    this.Setup();
    this.animId = this.RequestAnimFrame();
};

Interpol.AnimController.prototype.Setup = function() {
    var propertyName;
    var property;
    this.numBeginProperties = 0;
    for (propertyName in this.beginProperties) {
        if (this.HasPropertyController(propertyName)) {
            continue;
        }
        property = this.beginProperties[propertyName];
        if (!Interpol.Css.IsPropertyNumber(property)) {
            delete this.beginProperties[propertyName];
        }
        ++this.numBeginProperties;
    }
    this.numEndProperties = 0;
    for (propertyName in this.endProperties) {
        if (this.HasPropertyController(propertyName)) {
            continue;
        }
        property = this.endProperties[propertyName];
        if (!Interpol.Css.IsPropertyNumber(property)) {
            delete this.endProperties[propertyName];
        }
        ++this.numEndProperties;
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
    var properties = this.numBeginProperties > this.numEndProperties ? this.beginProperties : this.endProperties;
    var otherProperties = this.numBeginProperties > this.numEndProperties ? this.endProperties : this.beginProperties;
    for (var propertyName in properties) {
        if (otherProperties[propertyName] !== undefined) {
            if (self.HasPropertyController(propertyName)) {
                var controller = self.GetPropertyController(propertyName);
                controller.Do(self.beginProperties[propertyName], self.endProperties[propertyName], t);
            } else if (Interpol.Css.GetPropertyUnitStr(this.beginProperties[propertyName]) === Interpol.Css.GetPropertyUnitStr(this.endProperties[propertyName])) {
                var beginPropertyVal = parseFloat(this.beginProperties[propertyName]);
                var endPropertyVal = parseFloat(this.endProperties[propertyName]);
                var propertyVal = this.args.method(beginPropertyVal, endPropertyVal, t);
                this.args.object.style.setProperty(propertyName, propertyVal + Interpol.Css.GetPropertyUnitStr(this.beginProperties[propertyName]), "");
            } else {
                console.log("Error: Property '" + propertyName + "': Neither was a property controller found, nor is the property a number with consistent units!");
            }
        } else console.log("Mismatching properties!");
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
    return str.charAt(0) === "#" && (str.length - 1) % 3 === 0;
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

Interpol.PropertyControllers = {};

Interpol.PropertyControllers.ColorPropertyController = function(args, propertyName) {
    this.args = args;
    this.propertyName = propertyName;
};

Interpol.PropertyControllers.ColorPropertyController.prototype.Do = function(beginProperty, endProperty, t) {
    var self = this;
    beginProperty = Interpol.StrUtils.ToRgba(beginProperty);
    endProperty = Interpol.StrUtils.ToRgba(endProperty);
    var beginColor = Interpol.StrUtils.RgbaToColor(beginProperty);
    var endColor = Interpol.StrUtils.RgbaToColor(endProperty);
    var color = {
        r: parseInt(self.args.method(beginColor.r, endColor.r, t)),
        g: parseInt(self.args.method(beginColor.g, endColor.g, t)),
        b: parseInt(self.args.method(beginColor.b, endColor.b, t)),
        a: self.args.method(beginColor.a, endColor.a, t)
    };
    this.args.object.style[this.propertyName] = Interpol.StrUtils.BuildRgbaStr(color.r, color.g, color.b, color.a);
};