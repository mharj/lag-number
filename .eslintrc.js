module.exports = {
	"extends": "google",
	"env": {
		"es6": true,
		"node" : true,
		"jquery": true,
		"browser": true
	},
	"parserOptions": {
		"ecmaVersion": 2018,
		"sourceType": "module",
		"ecmaFeatures": {
			"modules": true,
		}
	},
	"rules": {
		"require-jsdoc": 1,
		"indent": ["error", "tab", {"SwitchCase": 1}],
		"no-tabs": 0,
		'max-len': [ 2, {
			code: 240,
			tabWidth: 2,
			ignoreUrls: true,
			ignoreTrailingComments: true
		}],
		'no-console': 1,
		'eqeqeq': "warn",
		'quotes': ["error", "single"],
		'curly': ['error', 'all'],
		'newline-per-chained-call': ['error',{ "ignoreChainWithDepth": 2 }],
		'key-spacing': ["error", {"mode": "minimum",}]
	}
};
