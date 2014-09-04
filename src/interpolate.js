var Interpol = {};

Interpol.Do = function(args) {
	/* Check required args */
	if(!args) return false;
	if(!args.object) return false;
	if(!args.start) return false;
	if(!args.end) return false;

	/* Default args */
	if(!args.method) args.method = Interpol.Interpols.Lerp;
	if(!args.animController) args.animController = Interpol.AnimController;
	if(!args.time) args.time = 1000;

	/* Gather begin attributes */
	var beginAttribs = Interpol.Css.GetAllCssAttribs(args.start);

	/* Gather end attributes */
	var endAttribs = Interpol.Css.GetAllCssAttribs(args.end);

	/* Do animation */
	var animController = new args.animController(args, beginAttribs, endAttribs);
	animController.Run();

	return true;
}



/*

API:

var % = Interpol;

%.Do({
	object: $("#myCoolObject"),
	start: ".red",
	end: ".blue",
	method: %.Interpols.Lerp, // optional
	time: 1000 // 1 second, optional
});



*/