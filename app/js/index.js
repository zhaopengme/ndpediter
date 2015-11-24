var gui = require("nw.gui");
if (process.platform === "darwin") {
  var mb = new gui.Menu({type: 'menubar'});
  mb.createMacBuiltin('RoboPaint', {
    hideEdit: false,
  });
  gui.Window.get().menu = mb;
}
window.onload = function () {
	var win = gui.Window.get();
	win.show(win);
	window.win = win;
	window.editormd = editormd;
	window.$ = $;
	window.layer = layer;
	var App = require('./js/app');
	new App().init();
}