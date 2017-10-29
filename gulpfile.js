var gulp = require('gulp')
var sass = require('gulp-sass')
var cssmin = require('gulp-cssmin')
var rename = require('gulp-rename')

var config = {
  name: 'index.min.css',
  src: './src/main.scss',
  dist: './lib'
}

console.log('STYLE BUILD...\n')

gulp.task('build', function () {
  return gulp.src(config.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(cssmin())
    .pipe(rename(config.name))
    .pipe(gulp.dest(config.dist))
})

console.log('STYLE BUILD COMPLETE\n')
