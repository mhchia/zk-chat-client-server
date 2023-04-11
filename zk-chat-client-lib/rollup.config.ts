import typescript from "rollup-plugin-typescript2"
import { nodeResolve } from '@rollup/plugin-node-resolve'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import commonjs from '@rollup/plugin-commonjs'
import cleaner from 'rollup-plugin-cleaner'
import replace from '@rollup/plugin-replace'
import json from '@rollup/plugin-json';
import * as fs from "fs"


const input = 'src/index.ts'
const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"))
const banner = `/**
 * @module ${pkg.name}
 * @version ${pkg.version}
 * @file ${pkg.description}
 * @copyright ${pkg.author.name} ${new Date().getFullYear()}
 * @license ${pkg.license}
 * @see [Github]{@link ${pkg.homepage}}
*/`


const typescriptPlugin = typescript({
    tsconfig: "./build.tsconfig.json",
    useTsconfigDeclarationDir: true,
})

const nodePlugins = [
    typescriptPlugin,
    // `browser: false` is required for `fs` and other Node.js core modules to be resolved correctly
    nodeResolve({ browser: false }),
    // To accept commonjs modules and convert them to ES module, since rollup only bundle ES modules by default
    commonjs(),
    // Parse JSON files and make them ES modules. Required when bundling circomlib
    json(),
    nodePolyfills(),
]


const browserPlugins = [
    typescriptPlugin,
    replace({
      'process.browser': JSON.stringify(true),
      // To avoid unexpected behavior that the warning suggests.
      'preventAssignment': true,
    }),
    // Resolve the import from node_modules.
    // `browser: true` is required for `window` not to be undefined
    // Ref: https://github.com/iden3/snarkjs/blob/782894ab72b09cfad4dd8b517599d5e7b2340468/src/taskmanager.js#L20-L24
    nodeResolve({ browser: true }),
    commonjs(),
    json(),
    // Replace node built-in modules with polyfills
    nodePolyfills(),
]

export default [
    // Node.js build
    // {
    //   input,
    //   output: { file: pkg.exports.require, format: 'cjs', banner },
    // //   external: Object.keys(pkg.dependencies),
    //   plugins: [
    //     cleaner({
    //       targets: [
    //         './dist/',
    //       ],
    //     }),
    //     ...nodePlugins,
    //   ],
    // },
    // Browser build
    {
      input,
      output: { file: pkg.exports.import, format: 'es', banner },
      plugins: [
        cleaner({
            targets: [
              './dist/',
            ],
        }),
        ...browserPlugins,
      ],
    },
]
