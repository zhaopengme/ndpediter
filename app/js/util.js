layer = window.layer;
var qiniu = require('qiniu');

/**
 * [获取文件名]
 * @param   {string}   fullFilePath [[Description]]
 * @returns {[[Type]]} [[Description]]
 */
exports.getFileName = function (fullFilePath) {
	if (fullFilePath) {
		var startIndex = (fullFilePath.indexOf('\\') >= 0 ? fullFilePath.lastIndexOf('\\') : fullFilePath.lastIndexOf('/'));
		var filename = fullFilePath.substring(startIndex);
		if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
			filename = filename.substring(1);
		}
		return filename;
	}
	return 'default';
};
/**
 * 获取文件后缀 for getFileSuffix 
 * @private
 * @method getFileSuffix 
 * @param {Object} fullFilePath
 * @return {Object} description
 */
exports.getFileSuffix = function (fullFilePath) {
	var suffix = '';
	var fileName = this.getFileName(fullFilePath);
	if (fileName.lastIndexOf('.') > -1) {
		var idx = fileName.lastIndexOf('.')
		suffix = fileName.substr(idx);
	}
	return suffix;
};

/**
 * 打开 dialog for dialog 
 * @private
 * @method openModal 
 * @param {Object} options
 * @return {Object} description
 */
exports.dialog = function (options) {
	layer.open({
		type: 1,
		area: [options.width + 'px', options.height + 'px'],
		title: options.title || 'title',
		shade: 0.6,
		moveType: 1,
		shift: 5,
		content: options.content,
		btn: options.btns,
		yes: function (index) {
			if (options.ok) {
				options.ok();
			}
			setTimeout(function () {
				layer.close(index);
			}, 200);
		},
		no: options.error
	});
};

/**
 * 信息提醒 for msg 
 * @private
 * @method msg 
 * @param {Object} msg
 * @return {Object} description
 */
exports.msg = function (msg) {
	layer.msg(msg);
};


/**
 * 错误信息提醒 for error 
 * @private
 * @method error 
 * @param {Object} msg
 * @return {Object} description
 */
exports.error = function (msg) {
	layer.msg(msg, {
		icon: 2
	});
};


/**
 * 上传文件 for uploadFile 
 * @private
 * @method uploadFile 
 * @param {Object} options
 * @param {Object} params
 * @return {Object} description
 */
exports.uploadFile = function (options, params, callback) {
	console.log(options);
	qiniu.conf.SECRET_KEY = options.SECRET_KEY;
	qiniu.conf.ACCESS_KEY = options.ACCESS_KEY;
	var putPolicy = new qiniu.rs.PutPolicy(options.BUCKET_NAME);
	var uptoken = putPolicy.token();
	var extra = new qiniu.io.PutExtra();

	qiniu.io.putFile(uptoken, params.key, params.filePath, extra, function (err, ret) {
		if (err) {
			console.log(err);
			return callback(err);
		} else {
			var url = ret.key;
			if (callback) {
				console.log(options.QINIU_URL + url);
				return callback(options.QINIU_URL + url);
			}
		}
	});
};

/**
 * 获取 guid for guid 
 * @private
 * @method guid 
 * @param {Object} options
 * @param {Object} params
 * @return {Object} description
 */
exports.guid = function (options, params) {
	function S4() {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	}
	return (S4() + S4() + "" + S4() + "" + S4() + "" + S4() + "" + S4() + S4() + S4());
};