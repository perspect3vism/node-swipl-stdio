const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = {
  input: './index.js',
  output: [
    {
      format: 'cjs',
      file: "lib/index.cjs",
    },
    {
      format: 'esm',
      file: "lib/index.js",
    }
  ],
  plugins: [
    nodeResolve(),
    commonjs()
  ]
};