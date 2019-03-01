const del = require('del');
const gulp = require('gulp');
const path = require('path');
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
  return gulp
    .src(demoPath)
    .pipe(gulp.dest(distPath));
}

function demoJs() {
  return gulp
    .src(demoJsPath)
    .pipe(codemod('demo'))
    .pipe(gulp.dest(distPath));
}

async function clean() {
  await del([`${distPath}`, `${distPath}/**/*`, `${buildPath}`, `${buildPath}/**/*`]);
}

function jsDev() {
  return gulp
    .src(jsFiles, {
      since: gulp.lastRun(jsDev)
    })
    .pipe(eslint({
      fix: true
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(codemod('src'))
    .pipe(replace(/@\/.*/ig, function (value) {
      const relative = path.relative(path.dirname(this.file.path), 'miniprogram_npm');
      return value.replace(/@/, relative);
    }))
    .pipe(gulp.dest(jsDistPath));
}
jsDev.displayName = 'js:dev';

function jsBuild() {
  return gulp
    .src(jsFiles, {
      since: gulp.lastRun(jsDev)
    })
    .pipe(eslint({
      fix: true
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(replace(/@\/.*/ig, function (value) {
      const relative = path.relative(path.dirname(this.file.path), 'miniprogram_npm');
      return value.replace(/@/, relative.replace(/\/miniprogram_npm/, ''));
    }))
    .pipe(gulp.dest(jsDistPath));
}
jsBuild.displayName = 'js:build';

gulp.task(copy);
gulp.task(demoJs);
gulp.task(clean);
gulp.task(jsDev);
gulp.task(jsBuild);
gulp.task('build', gulp.series(clean, jsBuild));
gulp.task('watch', () => {
  gulp.watch(jsFiles, jsDev);
  gulp.watch(demoPath, copy);
  gulp.watch(demoJsPath, demoJs);
});
gulp.task('dev', gulp.series(clean, install, gulp.parallel(copy, demoJs, jsDev), 'watch'));
