var gulp = require('gulp')
var babel = require("gulp-babel")
var sourcemaps = require("gulp-sourcemaps")

gulp.task('build', [], function() {

  gulp.src(['./app/**/*.jsx', './app/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest('./build/'));

  gulp.src(['./app/**/*.html', './app/**/*.*'])
    .pipe(gulp.dest('./build/'))
});
