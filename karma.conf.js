process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
	config.set({
		frameworks: ['mocha'],
		files: [
			'test/**/*.spec.js'
		],
		preprocessors: {
			'test/**/*.spec.js': ['webpack'],
		},
		autoWatch: false,
		browsers: ['ChromeHeadless'],
		singleRun: true,
		webpack: {
			mode: 'production',
		},
		webpackMiddleware: {
			stats: 'errors-only',
		},
	});
};
