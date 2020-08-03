/* eslint-disable quote-props */
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import * as react from 'react'
import * as reactDom from 'react-dom'
import * as reactIs from 'react-is'
import * as lodash from 'lodash'
// import pkg from "./package.json";

const env = process.env.NODE_ENV
const isDevelopment = env === 'development'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

export default {
  input: './src/index.ts',

  external: id => {
    const list = [
      'react',
      'react-dom',
      'lodash',
      'redux',
      'react-redux',
      'redux-saga',
      'reselect',
      'immutability-helper-x',
      'invariant',
      'react-router-dom',
      'regenerator-runtime/runtime'
    ]

    if (list.includes(id) || /core-js/.test(id)) {
      return true
    }
    return false
  },

  plugins: [
    // Allows node_modules resolution
    resolve({ extensions }),

    // Allow bundling cjs modules. Rollup doesn't understand cjs
    commonjs({
      namedExports: {
        react: Object.keys(react),
        'react-dom': Object.keys(reactDom),
        'react-is': Object.keys(reactIs),
        lodash: Object.keys(lodash)
      }
    }),

    // Compile TypeScript/JavaScript files
    babel({ extensions, include: ['src/**/*'] })
  ],

  output: [
    {
      file: isDevelopment
        ? 'dist/kop.dev.common.js'
        : 'dist/kop.prod.common.js',
      format: 'cjs'
    },
    {
      file: 'dist/kop.esm.js',
      format: 'es'
    }
  ]
}
