import babel from 'rollup-plugin-babel';

export default [
	{
		plugins: [
			babel({
				exclude: 'node_modules/**',
			}),
		],
		external: [
			'path-to-regexp',
			'url-parse',
		],
		input: 'src/index.js',
		output: {
			file: 'dist/ninelines-router.es.js',
			format: 'es',
			globals: {
				'path-to-regexp': 'pathToRegexp',
				'url-parse': 'URL',
			},
		},
	},
	{
		plugins: [
			babel({
				exclude: 'node_modules/**',
			}),
		],
		external: [
			'path-to-regexp',
			'url-parse',
		],
		input: 'src/index.js',
		output: {
			file: 'dist/ninelines-router.umd.js',
			format: 'umd',
			name: 'Router',
			globals: {
				'path-to-regexp': 'pathToRegexp',
				'url-parse': 'URL',
			},
		},
	},
];
