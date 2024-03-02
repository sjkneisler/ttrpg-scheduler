const path = require('path');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = {
	paths: function (paths, env) {
		// Changing public to static
		paths.appPublic = path.resolve(__dirname, 'app/public');
		paths.appHtml = path.resolve(__dirname, 'app/public/index.html');
		paths.appIndexJs = path.resolve(__dirname, 'app/src/index.tsx');
		// paths.appSrc = path.resolve(__dirname, 'app/src');
		paths.appSrc = path.resolve(__dirname, '');
		return paths;
	},

	// override: function override(config, env) {
	// 	config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));
	//
	// 	return config;
	// }

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