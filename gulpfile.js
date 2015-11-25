var gulp = require('gulp')
var babel = require("gulp-babel")
var sourcemaps = require('gulp-sourcemaps')
var packager = require('electron-packager')
var replace = require('gulp-replace')
var shell = require('gulp-run')


// Variables
var packageVersion = '0.1'
var packageName = 'LightBlue-Bean-FW-Updater'
var electronVersion = '0.30.4' // see package.json


function _getBuildOptions(platform) {
  return {
    dir: '.',
    name: 'Bean FW Updater',
    platform: platform,
    arch: 'x64',
    version: electronVersion,
    out: './build/',
    prune: true,
    overwrite: true,
    asar: true
  }
}


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
})

gulp.task('package-osx', ['build'], function () {
  /**
   * Package the application into an OSX .app file ready for distribution
   */

  var opts = _getBuildOptions('darwin')
  packager(opts, function (err, appPath) {
    if (err)
      console.log('Error during OSX build: ' + err)
    else
      console.log('OSX Build success')
  })
})

gulp.task('package-win', ['build'], function () {
  /**
   * Package the application into an OSX .app file ready for distribution
   */

  gulp.src('node_modules/noble/node_modules/bluetooth-hci-socket/node_modules/usb/binding.gyp')
    .pipe(replace("'use_system_libusb%': 'false',", "'use_system_libusb%': 'false',\n'module_name': 'usb_bindings',\n'module_path': './src/binding',"))
    .pipe(gulp.dest('node_modules/noble/node_modules/bluetooth-hci-socket/node_modules/usb/'));

  shell('cd node_modules/noble/node_modules/bluetooth-hci-socket/node_modules/usb && node-gyp rebuild --target=' + electronVersion + ' --dist-url=https://atom.io/download/atom-shell').exec();
  shell('cd node_modules/noble/node_modules/bluetooth-hci-socket && node-gyp rebuild --target=' + electronVersion + ' --dist-url=https://atom.io/download/atom-shell').exec();

  var opts = _getBuildOptions('win32')
  opts['version-string'] = {
    CompanyName: 'Punch Through',
    LegalCopyright: '2015',
    FileDescription: 'Punch Through FW Updater for LightBlue Bean',
    FileVersion: packageVersion,
    OriginalFilename: packageName + '.exe',
    ProductVersion: packageVersion,
    ProductName: packageName
  }

  packager(opts, function (err, appPath) {
    if (err)
      console.log('Error during Windows build: ' + err)
    else
      console.log('Windows Build success')
  })
})
