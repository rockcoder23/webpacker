var webpacker = require('../src/webpacker.js'),
	config = require('./webpack.test.config.js');

webpacker.buildBundle(config, {done: function(){
	console.log('build success...');
}});