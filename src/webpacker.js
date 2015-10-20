var webpack = require('webpack'),
    path = require('path'),
    MemoryFileSystem = require("memory-fs");

var WebPacker = function(wpConfig, option) {
    this.appfile = wpConfig.entry;
    this.distpath =  wpConfig.output.path;
    this.distFile = this.distpath + wpConfig.bundleName;
    this.done = option.done;
}

// 缓存(了complier & filesystem)
WebPacker.cache = {};
WebPacker.cache.webpackFileSystem = new MemoryFileSystem();

// true： bundle已经build好了； false: bundle 未build完成
WebPacker.isBundleValid = true;
WebPacker.callbacks = [];

// 构造complier，init filesystem
WebPacker.prototype.init = function() {
    var me = this,
        cache = WebPacker.cache;

    if (me.appfile != cache.lastReqFile) {

        // 创建新的complier
        me.compiler = webpack(wpConfig);

        // 每次把新建的complier缓存起来；
        cache.compiler = me.compiler;
        cache.lastReqFile = me.appfile;
    } else {

        //如果上一次请求与本次一致，则使用上一次complier
        me.compiler = cache.compiler;
    }

    // 始终使用统一的memoryfilesystem;
    if (!cache.compiler.outputFileSystem.readFileSync) {
        cache.compiler.outputFileSystem = cache.webpackFileSystem;
    }

    // 添加plugin在build完成后处理之前delay的请求；
    me.compiler.plugin("done", function(stats) {

        WebPacker.isBundleValid = true;

        process.nextTick(function() {
            if(!WebPacker.isBundleValid) return;
            var cbs = WebPacker.callbacks;
            WebPacker.callbacks = [];
            cbs.forEach(function continueBecauseBundleAvailible(cb) {
                cb();
            });
        });
    });
}

// buildbundle
WebPacker.prototype.buildBundle = function() {
    var me = this;

    // buildBundle
    if (WebPacker.isBundleValid) {
        WebPacker.isBundleValid = false;
        me.compiler.run(me.ouputContent.bind(me));
    } else {
        WebPacker.callbacks.push(me.ouputContent.bind(me));
    }
}

// 返回build好的数据给调用者
WebPacker.prototype.ouputContent = function(err, stats) {
    var me = this, 
        jsContent,
        cache = WebPacker.cache;
    if(err) {throw err; me.done && me.done(null); return;}
    if(stats.hasErrors()){
        console.log(stats.toJson().errors);
    } 

    //获取编译后的js内容
    jsContent = cache.compiler.outputFileSystem.readFileSync(me.distFile);
    me.done && me.done(jsContent);
}


function buildBundle(wpConfig, option) {
    var webpacker = new WebPacker(wpConfig, option);
    webpacker.init();
    webpacker.buildBundle();
}

exports.buildBundle = buildBundle;
