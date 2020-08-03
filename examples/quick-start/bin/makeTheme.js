#!/usr/bin/env node
const shelljs = require('shelljs');
const postcss = require('postcss');
const fs = require('fs');
const less = require('postcss-less-engine');
const autoprefixer = require('autoprefixer');
const clean = require('postcss-clean');
const pxtorem = require('postcss-pxtorem');
const pack = require('../package');

const cwd = process.cwd();
const antdVersion = pack.dependencies.antd;

function buildCss(doClean, dist) {
  const src = `${cwd}/bin/theme.less`;
  console.log(dist);
  try {
    const lessContent = fs.readFileSync(src);
    console.log(lessContent.length);
    const arr = [less()];

    // 目前没有生成mobile版本的需求
    const usePxtorem = false;
    if (usePxtorem) {
      // 是否启用 px to rem 的转换
      arr.push(
        pxtorem({
          rootValue: 100,
          propWhiteList: [],
          replace: usePxtorem,
        })
      );
    }

    arr.push(autoprefixer());
    if (doClean) {
      arr.push(clean());
    }
    postcss(arr)
      .process(lessContent, {
        parser: less.parser,
        from: src,
      })
      .then(
        res => {
          const output = res.css;
          console.log(output.length);
          fs.writeFile(dist, output, err => {
            if (err) {
              console.error(err);
            }
            console.log(`build success: ${dist}`);
          });
        },
        err => {
          console.error(err);
        }
      );
  } catch (e) {
    console.error(e);
  }
}

buildCss(false, `${cwd}/libs/antd/${antdVersion}/antd.css`);
buildCss(true, `${cwd}/libs/antd/${antdVersion}/antd.min.css`);
