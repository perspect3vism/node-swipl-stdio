const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = {
  input: './index.js',
  output: [
    {
      format: 'cjs',
      file: "dist/index.cjs",
    },
    {
      format: 'esm',
      file: "dist/index.js",
    }
  ],
  plugins: [
    nodeResolve(),
    commonjs()
  ]
};