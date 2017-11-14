const gulp   = require('gulp');
const coffee = require('gulp-coffee');
const concat = require('gulp-concat');
const sass   = require('gulp-sass');

gulp.task('coffee', () => {
    gulp
        .src([
            './data/coffee/**/*.coffee'
        ])
        .pipe(coffee({
            bare: true
        }))
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./data/build'));
});

gulp.task('sass', () => {
    gulp
        .src([
            './data/sass/**/*.scss'
        ])
        .pipe(sass())
        .pipe(gulp.dest('./data/build'));
});

gulp.task('watch', () => {
    gulp.watch('./data/coffee/**/*.coffee', ['coffee']);
    gulp.watch('./data/sass/**/*.scss', ['sass']);
});

gulp.task('default', ['coffee', 'sass']);