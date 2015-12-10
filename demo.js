var newButton, openButton, saveButton;
var mdEditor;
var menu;
var fileEntry;
var hasWriteAccess;

var gui = require("nw.gui");
var fs = require("fs");
//  七牛 sdk
var qiniu = require('qiniu');

// 文件工具
var fsutils = require('fs-utils');
//配置文件，主要是存储七牛的密钥信息

var config = './config.json';
var options = null;


if (!fs.existsSync(config)) {
    options = {
        "ACCESS_KEY": '',
        "SECRET_KEY": '',
        "QINIU_URL": '',
        "BUCKET_NAME": ''
    }
    qiniuconfig(function () {
        location.reload();
    });
} else {
    options = fsutils.readJSONSync(config)

}



function newFile() {
    fileEntry = null;
    hasWriteAccess = false;
}

//保存文件按钮按下
function handleSaveButton() {
    if (fileEntry && hasWriteAccess) {
        writeEditorToFile(fileEntry);
    } else {
        $("#saveFile").trigger("click");
    }
}
//保存文件
var onChosenFileToSave = function (theFileEntry) {
    setFile(theFileEntry, true);
    writeEditorToFile(theFileEntry);
};
//选择文件
var onChosenFileToOpen = function (theFileEntry) {
    setFile(theFileEntry, false);
    readFileIntoEditor(theFileEntry);
};
// 选择打开文件
function handleOpenButton() {
    $("#openFile").trigger("click");
}


function setFile(theFileEntry, isWritable) {
    fileEntry = theFileEntry;
    hasWriteAccess = isWritable;
}
//将编辑器的内容保存到文件中
function writeEditorToFile(theFileEntry) {
    var content = mdEditor.getMarkdown()
    fs.writeFile(theFileEntry, content, function (err) {
        if (err) {
            console.log("Write failed: " + err);
            return;
        }
        console.log("Write completed.");
    });
}
//读取文件内容到编辑器
function readFileIntoEditor(theFileEntry) {
    fs.readFile(theFileEntry, function (err, data) {
        if (err) {
            console.log("Read failed: " + err);
        }
        mdEditor.setMarkdown(String(data))
    });
}


//读取图片文件名称
function getFileName(file) {
    var fullPath = file;
    if (fullPath) {
        var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
        var filename = fullPath.substring(startIndex);
        if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
            filename = filename.substring(1);
        }
        return filename;
    }
    return file;
}


//将图片的 url 插入到编辑器中
function insertImageMd(url, alt, link) {
    if (url === "") {
        alert('图片地址为空');
        return false;
    }

    var altAttr = (alt !== "") ? " \"" + alt + "\"" : "";

    if (link === "" || link === "http://") {
        mdEditor.replaceSelection("![" + alt + "](" + url + altAttr + ")");
    } else {
        mdEditor.replaceSelection("[![" + alt + "](" + url + altAttr + ")](" + link + altAttr + ")");
    }

    if (alt === "") {
        mdEditor.setCursor(mdEditor.getCursor().line, mdEditor.getCursor().ch + 2);
    }

}
//上传图片到七牛
function fileToQiniu(params, callback) {
    qiniu.conf.SECRET_KEY = options.SECRET_KEY;
    var bucketname = options.BUCKET_NAME;
    var putPolicy = new qiniu.rs.PutPolicy(bucketname);
    var uptoken = putPolicy.token();
    var extra = new qiniu.io.PutExtra();

    var key = params['key'];
    var filePath = params['filePath'];
    var fileName = params['fileName'];
    qiniu.io.putFile(uptoken, key, filePath, extra, function (err, ret) {
        if (err) {
            return callback(err);
        } else {
            var url = '@' + ret.key;
            if (callback) {
                return callback(options.QINIU_URL + url);
            }
        }
    });
}
//七牛配置信息弹出框
function qiniuconfig(callback) {
    var t = '<div style="padding:15px;"><form class="editormd-form"><label>ACCESS_KEY</label><input type="text" data-access_key="" value="' + options.ACCESS_KEY + '"><br><label>SECRET_KEY</label><input type="text" data-secret_key="" value="' + options.SECRET_KEY + '"><br><label>QINIU_URL</label><input type="text" data-qiniu_url="" value="' + options.QINIU_URL + '"><br><label>BUCKET_NAME</label><input type="text" data-bucket_name="" value="' + options.BUCKET_NAME + '"><br></form></div>';
    layer.open({
        type: 1, //page层
        area: ['500px', '300px'],
        title: '你好，layer。',
        shade: 0.6, //遮罩透明度
        moveType: 1, //拖拽风格，0是默认，1是传统拖动
        shift: 5, //0-6的动画形式，-1不开启
        content: t,
        btn: ['保存'],
        yes: function (index, layero) { //或者使用btn1
            var accessKey = $('input[data-access_key]').val();
            var secretKey = $('input[data-secret_key]').val();
            var qiniuUrl = $('input[data-qiniu_url]').val();
            var bucketName = $('input[data-bucket_name]').val();
            options = {
                "ACCESS_KEY": accessKey,
                "SECRET_KEY": secretKey,
                "QINIU_URL": qiniuUrl,
                "BUCKET_NAME": bucketName
            }
            fsutils.writeJSON(config, options);
            layer.close(index);
            if (callback) {
                callback();
            }
        }
    });

}



onload = function () {
    gui.Window.get().show();
    //初始化编辑器
    mdEditor = editormd("editormd", {
        width: "100%",
        height: "600",
        syncScrolling: "single",
        path: "./verdor/editor/lib/",
        watch: false,
        toolbarIcons: function () {
            var toolbars = editormd.toolbarModes['full'];
            toolbars.push('|')
            toolbars.push('config')
            toolbars.unshift('|')
            toolbars.unshift('save')
            toolbars.unshift('new')
            toolbars.unshift('open')
            console.log(toolbars);
            return toolbars; // full, simple, mini
        },
        toolbarCustomIcons: {
            open: '<a href="javascript:;" title="打开（Ctrl+O）"><i class="fa fa-file-o" name="open"></i></a>',
            new: '<a href="javascript:;" title="新建（Ctrl+N）"><i class="fa fa-file" name="new"></i></a>',
            save: '<a href="javascript:;" title="保存（Ctrl+S）"><i class="fa fa-floppy-o" name="save"></i></a>',
            config: '<a href="javascript:;" title="配置（Ctrl+P）"><i class="fa fa-cogs" name="config"></i></a>'
        },
        toolbarHandlers: {
            open: function (cm, icon, cursor, selection) {
                //                console.log("testIcon2 =>", this, icon.html());
                handleOpenButton();
            },
            new: function (cm, icon, cursor, selection) {
                console.log("testIcon2 =>", this, icon.html());
            },
            save: function (cm, icon, cursor, selection) {
                console.log("testIcon2 =>", this, icon.html());
                //                writeEditorToFile(fileEntry);
                handleSaveButton();

            },
            config: function (cm, icon, cursor, selection) {
                qiniuconfig();
            },
            image: function (cm, icon, cursor, selection) {}
        }
    });
    setTimeout(function () {
        mdEditor.toolbarHandlers.image = function () {
            var t = '<div style="padding:15px;"><form class="editormd-form"><label>图片地址</label><input type="text" data-url=""><div class="editormd-file-input"><input type="file" name="editormd-image-file" accept="image/*"><input type="submit" id="upload-btn" value="本地上传"></div><br><label>图片描述</label><input type="text" value="" data-alt=""><br><label>图片链接</label><input type="text" value="http://" data-link=""></form></div>';
            layer.open({
                type: 1, //page层
                area: ['500px', '300px'],
                title: '你好，layer。',
                shade: 0.6, //遮罩透明度
                moveType: 1, //拖拽风格，0是默认，1是传统拖动
                shift: 5, //0-6的动画形式，-1不开启
                content: t,
                btn: ['插入图片'],
                yes: function (index, layero) { //或者使用btn1
                    var url = $('input[data-url]').val();
                    var alt = $('input[data-alt]').val();
                    var link = $('input[data-link]').val();
                    insertImageMd(url, alt, link);
                    layer.close(index);
                }
            });




        };
    }, 1000);
    newFile();

    $("#saveFile").change(function (evt) {
        onChosenFileToSave($(this).val());
    });
    $("#openFile").change(function (evt) {
        onChosenFileToOpen($(this).val());
    });


    //上传图片
    $('body').off('change', 'input[name="editormd-image-file"]').on('change', 'input[name="editormd-image-file"]', function () {
        console.log($(this).val());
        var filePath = $(this).val();
        var fileName = getFileName($(this).val());
        var parmas = {
            key: ('' + fileName),
            filePath: filePath,
            fileName: fileName
        }
        fileToQiniu(parmas, function (url) {
            $('input[data-url]').val(url);
            $('input[data-alt]').val(fileName);
        })
    });

};
