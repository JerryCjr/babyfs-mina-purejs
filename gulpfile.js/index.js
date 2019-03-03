const path = require('path');
const del = require('del');
const {
  src,
  dest,
  series,
  parallel,
  lastRun,
  watch
} = require('gulp');
const eslint = require('gulp-eslint');
const replace = require('gulp-replace');

// env
const isBuild = process.argv.indexOf('--production') >= 0;

// path
const devPath = 'dist/miniprogram_dist';
const buildPath = 'miniprogram_dist';
const jsDistPath = isBuild ? buildPath : devPath;

const jsFiles = 'src/**/*.js';
const demoPath = ['demo/**/*', '!demo/**/*.js'];
const demoJsPath = 'demo/**/*.js';
const distPath = 'dist';

// install
const install = require('./install.js');
// codemod
const codemod = require('./codemod.js');

function copy() {
  return src(demoPath)
    .pipe(dest(distPath));
}

function jsDemo() {
  return src(demoJsPath)
    .pipe(codemod('demo'))
    .pipe(dest(distPath));
}
jsDemo.displayName = 'js:demo';

async function clean() {
  await del([`${distPath}`, `${distPath}/**/*`, `${buildPath}`, `${buildPath}/**/*`]);
}

function jsDev() {
  return src(jsFiles, { since: lastRun(jsDev) })
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(codemod('src'))
    .pipe(replace(/@\/.*/ig, function (value) {
      const relative = path.relative(path.dirname(this.file.path), 'miniprogram_npm');
      return value.replace(/@/, relative);
    }))
    .pipe(dest(jsDistPath));
}
jsDev.displayName = 'js:dev';

function jsBuild() {
  return src(jsFiles, { since: lastRun(jsDev) })
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(replace(/@\/.*/ig, function (value) {
      const relative = path.relative(path.dirname(this.file.path), 'miniprogram_npm');
      return value.replace(/@/, relative.replace(/\/miniprogram_npm/, ''));
    }))
    .pipe(dest(jsDistPath));
}
jsBuild.displayName = 'js:build';

function watcher() {
  watch(jsFiles, jsDev);
  watch(demoPath, copy);
  watch(demoJsPath, jsDemo);
}

const build = series(clean, jsBuild);
const dev = series(clean, install, parallel(copy, jsDemo, jsDev), watcher);

module.exports = {
  copy,
  jsDemo,
  clean,
  jsDev,
  jsBuild,
  dev,
  build,
  watcher
};
