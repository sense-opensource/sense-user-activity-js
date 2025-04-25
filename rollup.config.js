import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const commonInput = { input: 'src/index.ts' };

const playground = {
	...commonInput, // Entry point for the playground
	output: {
		file: 'playground/bundle.js', // Output bundled file
		format: 'iife', // Self-invoking function for browsers
		name: 'Sense', // Expose the library as a global variable named "Sense"
	},
	plugins: [resolve(), commonjs(), typescript()]
};

const dist = [
	// NPM Builds (CommonJS and ES Module)
	{
		...commonInput, // Entry point
		output: [
			{
				file: 'dist/sense.cjs.js',
				format: 'cjs', // CommonJS format for Node.js
				globals: {
					tslib: 'tslib', // Map tslib to a global variable
				},
			},
			{
				file: 'dist/sense.esm.js',
				format: 'esm', // ES Module format for modern bundlers
				globals: {
					tslib: 'tslib', // Map tslib to a global variable
				},
			},
			{
				file: 'dist/sense.js',
				format: 'iife', // IIFE format for browsers
				name: 'Sense', // Global variable name for the browser
				globals: {
					tslib: 'tslib', // Map tslib to a global variable
				},
			},
		],
		plugins: [resolve(), commonjs(), typescript()],
		external: ['tslib'], // Exclude tslib from the bundle for NPM
	},
	// Browser Build (IIFE for CDN)
	{
		...commonInput, // Entry point
		output: {
			file: 'dist/sense.min.js',
			format: 'iife', // Self-invoking function for browsers
			name: 'Sense', // Global variable name for the browser
			globals: {
				tslib: 'tslib', // Map tslib to a global variable
			},
		},
		external: ['tslib'], // Mark tslib as an external dependency
		plugins: [resolve(), commonjs(), typescript(), terser()],
	}
]

const buildType = process.env.BUILD;

export default (() => {
  switch (buildType) {
    case 'dist':
      return dist;
    case 'playground':
      return playground;
    default:
      return [dist, playground];
  }
})();