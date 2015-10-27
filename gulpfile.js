var gulp = require('gulp')
var babel = require("gulp-babel")
var sourcemaps = require('gulp-sourcemaps')
var packager = require('electron-packager')

gulp.task('build', [], function () {
  /**
   * Build the application source files and place them under the build/ directory
   */

  gulp.src(['./app/**/*.jsx', './app/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest('./build/'))

  gulp.src(['./app/**/*.html', './app/**/*.*'])
    .pipe(gulp.dest('./build/'))
});


gulp.task('package-osx', ['build'], function () {
  /**
   * Package the application into an OSX .app file ready for distribution
   */

  packager({
    dir: '.',
    name: 'Bean FW Updater',
    platform: 'darwin',
    arch: 'x64',
    version: '0.33.7',
    out: './build/',
    overwrite: true

  }, function(err, appPath) {
    if (err)
      console.log('Error during OSX build: ' + err)
    else
      console.log('OSX Build success')
  })
})
