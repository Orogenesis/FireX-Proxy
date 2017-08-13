const gulp   = require('gulp');
const coffee = require('gulp-coffee');
const concat = require('gulp-concat');

gulp.task('coffee', function() {
    gulp
        .src([
            './data/locale/*.coffee',
            './data/coffee/**/*.coffee'
        ])
        .pipe(coffee({
            bare: true
        }))
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./data/build'));
});

gulp.task('default', [
    'coffee'
]);