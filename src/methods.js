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

Interpol.Methods.Experimental = {};

Interpol.Methods.Experimental.Notice = function(x0, x1, t) {
	t = Math.abs(Math.sin(t * Math.PI * 2) * 0.05);
	return Interpol.Methods.Lerp(x0, x1, t);
};

Interpol.Methods.Experimental.Notice2 = function(x0, x1, t) {
	var first = -Math.sin(t * Math.PI * 1.5) * 0.5 + 0.5;
	var second = Math.min(first, 0.1);
	var foo = second / -0.1 + 1;
	t = second * foo;
	return Interpol.Methods.Lerp(x0, x1, t);
};