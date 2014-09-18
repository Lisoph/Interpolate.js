var Interpol = {};

Interpol.Do = function(args) {
	/* Check required args */
	if(typeof args == "undefined") return false;
	if(typeof args.object == "undefined") return false;
	if(typeof args.start == "undefined") return false;
	if(typeof args.end == "undefined") return false;

	/* Default args */
	if(typeof args.method == "undefined") args.method = Interpol.Methods.Lerp;
	if(typeof args.animController == "undefined") args.animController = Interpol.AnimController;
	if(typeof args.time == "undefined") args.time = 1000;
	if(typeof args.callbacks == "undefined") args.callbacks = {};
	if(typeof args.reverse == "undefined") args.reverse = false;

	/* If reverse is set to true, we simply switch begin and end */
	if(args.reverse) {
		var tmp = args.start;
		args.start = args.end;
		args.end = tmp;
	}

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
	method: %.Methods.Lerp, // optional
	time: 1000 // 1 second, optional
});



*/