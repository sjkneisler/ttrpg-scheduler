const path = require('path');
module.exports = {
	paths: function (paths, env) {
		// Changing public to static
		paths.appPublic = path.resolve(__dirname, 'app/public');
		paths.appHtml = path.resolve(__dirname, 'app/public/index.html');
		paths.appIndexJs = path.resolve(__dirname, 'app/src/index.tsx');
		paths.appSrc = path.resolve(__dirname, 'app/src');
		return paths;
	},
	// jest: function(config) {
	// 	config.collectCoverageFrom = ['app/src/**/*.{js,jsx,ts,tsx}', '!app/src/**/*.d.ts'];
	// 	config.testMatch = [
	// 		'<rootDir>/app/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
	// 		'<rootDir>/app/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
	// 	];
	// 	config.roots = ['<rootDir>/app/src'];
	// 	return config;
	// },
}