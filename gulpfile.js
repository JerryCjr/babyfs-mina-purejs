//
const del = require('del');

//
const webpack = require('webpack-stream');
const gulp = require('gulp');
const eslint = require('gulp-eslint');

// path
const srcPath = './src/*.js';
const buildPath = './miniprogram_dist';
const devPath = './miniprogram_dev';
const devJsPath = `${devPath}/miniprogram_npm`;

const demoSrc = './tools/demo';
const demoDistPath = './miniprogram_dev';

// env
const isDev = process.argv.indexOf('--develop') >= 0;

// clean
gulp.task('clean', done => {
  del.sync([`${buildPath}/**`, `${devPath}/**`]);
  done();
});

// js
const js = () => {
  return gulp
    .src(srcPath, {
      since: gulp.lastRun(js)
    })
    .pipe(
      eslint({
        fix: true
      })
    )
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(
      webpack({
        mode: isDev ? 'development' : 'production',
        devtool: isDev ? 'source-map' : 'none',
        output: {
          filename: 'index.js',
          libraryTarget: 'commonjs2'
        }
      })
    )
    .pipe(gulp.dest(isDev ? devJsPath : buildPath));
};
gulp.task(js);

// copy demo
gulp.task('demo', gulp.series(() => {
  return gulp
    .src('**/*', {
      cwd: demoSrc,
      base: demoSrc
    })
    .pipe(gulp.dest(demoDistPath));
}));

// watch
gulp.task('watch', () => {
  gulp.watch(srcPath, js);
});

// build
gulp.task('build', gulp.series('clean', 'js'));

// dev
gulp.task('dev', gulp.series('clean', 'demo', 'js', 'watch'));
