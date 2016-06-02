
window.onload = function () {
	window.editormd = editormd;
	window.$ = $;
	window.layer = layer;
	var App = require('./js/app');
	new App().init();
}
