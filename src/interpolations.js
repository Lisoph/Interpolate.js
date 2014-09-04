Interpol.Interpols = {};

Interpol.Interpols.Lerp = function(x0, x1, t) {
	return ((1 - t) * x0) + (t * x1);
}

Interpol.Interpols.Sin = function(x0, x1, t) {
	t = Math.sin((Math.PI / 2) * t);
	return Interpol.Interpols.Lerp(x0, x1, t);
}

Interpol.Interpols.Smooth = function(x0, x1, t) {
	t = (t * t) * (3 - (2 * t));
	return Interpol.Interpols.Lerp(x0, x1, t);
}

Interpol.Interpols.Square = function(x0, x1, t) {
	t = t * t;
	return Interpol.Interpols.Lerp(x0, x1, t);
}

Interpol.Interpols.InvSquare = function(x0, x1, t) {
	var invt = 1 - t;
	t = 1 - (invt * invt);
	return Interpol.Interpols.Lerp(x0, x1, t);
}