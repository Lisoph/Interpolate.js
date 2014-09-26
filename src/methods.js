Interpol.Methods = {};

Interpol.Methods.Lerp = function(x0, x1, t) {
	return ((1 - t) * x0) + (t * x1);
};

Interpol.Methods.Sin = function(x0, x1, t) {
	t = Math.sin((Math.PI / 2) * t);
	return Interpol.Methods.Lerp(x0, x1, t);
};

Interpol.Methods.Smooth = function(x0, x1, t) {
	t = (t * t) * (3 - (2 * t));
	return Interpol.Methods.Lerp(x0, x1, t);
};

Interpol.Methods.Square = function(x0, x1, t) {
	t = t * t;
	return Interpol.Methods.Lerp(x0, x1, t);
};

Interpol.Methods.InvSquare = function(x0, x1, t) {
	var invt = 1 - t;
	t = 1 - (invt * invt);
	return Interpol.Methods.Lerp(x0, x1, t);
};