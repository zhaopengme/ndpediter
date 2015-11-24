var util = require('./util')
var Config = require('./config')
var Editor = require('./editor')

/**
 *[app启动模块]
 */
module.exports = function () {
	var config = new Config();
	var editor  = new Editor();
	/**	
	 * 配置对象 for options
	 * @private
	 * @property options
	 */
	var options = null;
	/**
	 * app 启动初始化 for init 
	 * @private
	 * @method init 
	 * @return {Object} description
	 */
	this.init = function () {
		this._initConfig();
		this._initEditor();
	};
	/**
	 * 初始化配置信息 for _initConfig 
	 * @private
	 * @method _initConfig 
	 * @return {Object} description
	 */
	this._initConfig = function () {
		if (!config.checkConfig()) {
			config.createConfig();
		}
		options = config.readConfig();
		if (options.ACCESS_KEY==null||options.ACCESS_KEY==undefined || options.ACCESS_KEY.trim().length == 0) {
			options.noConfig = true; //没有配置
		}
		if(options.noConfig){
			config.openConfigDialog();
		}
	};
	/**
	 * 初始化编辑器 for _initEditor 
	 * @private
	 * @method _initEditor 
	 * @return {Object} description
	 */
	this._initEditor = function () {
		editor.init();
	};

};