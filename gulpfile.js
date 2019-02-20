//
const del = require('del');
const gulp = require('gulp');
const path = require('path');
const eslint = require('gulp-eslint');
const replace = require('gulp-replace');
const _ = require('./tools/utils.js');

// path
const jsFiles = './src/**/*.js';
const distPath = './miniprogram_dist';

// env
const isBuild = process.argv.indexOf('--production') >= 0;

// clean
gulp.task('clean', done => {
  del.sync(['miniprogram_npm/**/*', 'miniprogram_dist/**/*']);
  done();
});

// runtime
gulp.task('runtime', function () {
  return gulp
    .src('./official/**/*')
    .pipe(gulp.dest('./miniprogram_npm'));
});

// miniprogram_npm依赖导入
gulp.task('install', async done => {
  const cwd = path.join(__dirname, 'node_modules');
  const dirPath = path.join(__dirname, 'miniprogram_npm');
  const BABYFS_PUREJS = 'babyfs-wxapp-'; // 宝玩js模块
  const globOptions = {
    cwd,
    nodir: false
  };
  const comDirNames = await _.globSync(`+(${BABYFS_PUREJS}*)/`, globOptions);
  await _.removeDir(`${dirPath}`);
  // official包的拷贝
  gulp.src('./official/**/*')
    .pipe(gulp.dest('./miniprogram_npm'));
  // node_modules包的拷贝 eg: node_modules/babyfs-wxapp-request/miniprogram_dist/index.js => miniprogram_npm/babyfs-wxapp-request/index.js
  for (let i = 0, len = comDirNames.length; i < len; i++) {
    const filePath = comDirNames[i].slice(0, -1);
    gulp.src(path.join(cwd, filePath, 'miniprogram_dist/**'))
      .pipe(gulp.dest(path.join(dirPath, filePath)));
  }
  done();
});

// js
const js = () => {
  return gulp
    .src(jsFiles, {
      since: gulp.lastRun(js)
    })
    .pipe(eslint({
      fix: true
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(replace(/@\/.*/ig, function (value) {
      const relative = path.relative(path.dirname(this.file.path), 'miniprogram_npm');
      return isBuild ? value.replace(/@/, relative.replace(/\/miniprogram_npm/, '')) : value.replace(/@/, relative);
    }))
    .pipe(gulp.dest(distPath));
};
gulp.task(js);

// build
gulp.task('build', gulp.series('clean', gulp.series('install', 'js')));

// watch
gulp.task('watch', () => {
  gulp.watch(jsFiles, js);
});

// dev
gulp.task('dev', gulp.series('build', 'watch'));
