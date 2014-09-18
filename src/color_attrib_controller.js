Interpol.AttribControllers = {};

Interpol.AttribControllers.ColorAttribController = function(args, attribName) {
  this.args = args;
  this.attribName = attribName;
}

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
}