Interpol.AttribControllers = {};

Interpol.AttribControllers.BackgroundColorAttribController = function(object) {
  this.object = object;
}

Interpol.AttribControllers.BackgroundColorAttribController.prototype.Do = function(beginProperty, endProperty) {
  this.object.style.backgroundColor = "orange";
}