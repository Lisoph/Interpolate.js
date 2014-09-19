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