Interpol.Interpols = {};

Interpol.Interpols.Lerp = function(x0, x1, t) {
	return ((1 - t) * x0) + (t * x1);
}