var util = require('./util')
	// 获取用户路径
	//path.tempdir() // returns a temporary directory that is operating system specific 
	//path.homedir() // returns the user's home directory 
	//path.datadir(appname)
var path = require('path-extra');
var fs = require("fs");
var fsutils = require('fs-utils');
/**
 *[配置信息模块]
 */
module.exports = function () {

	/**
	 * 配置文件路径 for configPath
	 * @private
	 * @property configPath
	 */
	var configPath = path.homedir() + '/.mdeditorconfig';

	/**
	 * 检查配置文件是否存在 for checkConfig 
	 * @private
	 * @method checkConfig 
	 * @return {boolean} description
	 */
	this.checkConfig = function () {
		return fs.existsSync(configPath);
	};
	/**
	 * 创建一个空配置文件 for createConfig 
	 * @private
	 * @method createConfig 
	 */
	this.createConfig = function () {
		var options = {
			"ACCESS_KEY": '',
			"SECRET_KEY": '',
			"QINIU_URL": '',
			"BUCKET_NAME": ''
		}
		fsutils.writeJSON(configPath, options);
	};
	/**
	 * 保存配置 for saveConfig 
	 * @private
	 * @method saveConfig 
	 * @param {Object} options
	 */
	this.saveConfig = function (options) {
		fsutils.writeJSON(configPath, options);
	};
	/**
	 * 读取配置文件 for readConfig 
	 * @private
	 * @method readConfig 
	 * @return {json} description
	 */
	this.readConfig = function () {
		var options = fsutils.readJSONSync(configPath);
		return options;
	};



	/**
	 * 配置对话框 for openConfigDialog 
	 * @private
	 * @method openConfigDialog 
	 * @return {Object} description
	 */
	this.openConfigDialog = function () {
		var self = this;
		var options = self.readConfig();
		console.log(options);
		var t = '<div style="padding:15px;"><form class="editormd-form"><label>access key</label><input type="text" data-access_key="" value="' + options.ACCESS_KEY + '"><br><label>secret key</label><input type="text" data-secret_key="" value="' + options.SECRET_KEY + '"><br><label>qiniu url</label><input type="text" data-qiniu_url="" value="' + options.QINIU_URL + '"><br><label>bucket name</label><input type="text" data-bucket_name="" value="' + options.BUCKET_NAME + '"><br></form></div>';
		var prams = {
			width: '500',
			height: '300',
			title: '七牛配置',
			content: t,
			btns: ['确定'],
			ok: $.proxy(self._dialogOkCallback,self)
		}
		util.dialog(prams);
	};

	/**
	 * 对话框确定回调 for _dialogOkCallback 
	 * @private
	 * @method _dialogOkCallback 
	 * @return {Object} description
	 */
	this._dialogOkCallback = function () {
		var accessKey = $('input[data-access_key]').val();
		var secretKey = $('input[data-secret_key]').val();
		var qiniuUrl = $('input[data-qiniu_url]').val();
		var bucketName = $('input[data-bucket_name]').val();
		var options = {
			"ACCESS_KEY": accessKey,
			"SECRET_KEY": secretKey,
			"QINIU_URL": qiniuUrl,
			"BUCKET_NAME": bucketName
		}
		this.saveConfig(options);
		util.msg('保存成功!');
	}
};