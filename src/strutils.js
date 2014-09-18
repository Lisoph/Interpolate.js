Interpol.StrUtils = {};

String.prototype.Contains = function(str) {
  return this.indexOf(str) !== -1;
}

String.prototype.IsNumeric = function() {
  return !isNaN(this);
}

Interpol.StrUtils.BuildRgbaStr = function(r, g, b, a) {
  return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}

Interpol.StrUtils.IsHex = function(str) {
  str = str.trim();
  return str.charAt(0) === '#' && ((str.length - 1) % 3 == 0);
}

Interpol.StrUtils.HexToRgba = function(str, alpha) {
  str.trim();
  if(!this.IsHex(str)) return undefined;

  str = str.substr(1); // Get rid of '#'
  var val = parseInt(str, 16);

  var r = val >> 24; // 0xRRGGBBAA
  var g = (val >> 16) & 0xFF;
  var b = (val >> 8) & 0xFF;
  if(typeof alpha == "undefined") alpha = 1.0;

  return this.BuildRgbaStr(r, g, b, alpha);
}

Interpol.StrUtils.IsRgb = function(str) {
  str.trim();

  /* Check "rgb(" */
  if(str.substr(0, 4) !== "rgb(")
    return false;

  return true;
}

Interpol.StrUtils.RgbToRgba = function(str, alpha) {
  if(!this.IsRgb(str)) return undefined;
  str = str.replace(" ", ""); /* Remove all whitespaces */

  var strIndex = 4;
  var numStr = "";
  var digit;

  /* Read first number */
  while((digit = str.substr(strIndex, 1)).IsNumeric()) {
    numStr += digit.toString();
    ++strIndex;
  }

  var r = parseInt(numStr);
  if(isNaN(r)) return undefined;
  numStr = "";

  /* Eat "," */
  ++strIndex;

  /* Read second number */
  while((digit = str.substr(strIndex, 1)).IsNumeric()) {
    numStr += digit.toString();
    ++strIndex;
  }

  var g = parseInt(numStr);
  if(isNaN(g)) return undefined;
  numStr = "";

  /* Eat "," */
  ++strIndex;

  /* Read second number */
  while((digit = str.substr(strIndex, 1)).IsNumeric()) {
    numStr += digit.toString();
    ++strIndex;
  }

  var b = parseInt(numStr);
  if(isNaN(b)) return undefined;
  numStr = "";

  if(typeof alpha == "undefined") alpha = 1.0;
  return this.BuildRgbaStr(r, g, b, alpha);
}

Interpol.StrUtils.ToRgba = function(str, alpha) {
  return this.IsRgba(str) ? str :
    this.HexToRgba(str, alpha) || this.RgbToRgba(str, alpha) || undefined;
}

Interpol.StrUtils.IsRgba = function(str) {
  str.trim();

  /* Check "rgba(" */
  if(str.substr(0, 5) !== "rgba(")
    return false;

  return true;
}

Interpol.StrUtils.RgbaToColor = function(str) {
  str = str.replace(" ", ""); /* Remove all whitespaces */

  var strIndex = 5;
  var numStr = "";
  var digit;

  /* Read first number */
  while((digit = str.substr(strIndex, 1)).IsNumeric()) {
    numStr += digit.toString();
    ++strIndex;
  }

  var r = parseInt(numStr);
  if(isNaN(r)) return undefined;
  numStr = "";

  /* Eat "," */
  ++strIndex;

  /* Read second number */
  while((digit = str.substr(strIndex, 1)).IsNumeric()) {
    numStr += digit.toString();
    ++strIndex;
  }

  var g = parseInt(numStr);
  if(isNaN(g)) return undefined;
  numStr = "";

  /* Eat "," */
  ++strIndex;

  /* Read second number */
  while((digit = str.substr(strIndex, 1)).IsNumeric()) {
    numStr += digit.toString();
    ++strIndex;
  }

  var b = parseInt(numStr);
  if(isNaN(b)) return undefined;
  numStr = "";

  /* Eat "," */
  ++strIndex;

  /* Read second number */
  while((digit = str.substr(strIndex, 1)).IsNumeric() || digit === '.') {
    numStr += digit.toString();
    ++strIndex;
  }

  var a = parseFloat(numStr);
  if(isNaN(a)) return undefined;
  numStr = "";

  return {r:r, g:g, b:b, a:a};
}