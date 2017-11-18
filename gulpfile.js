const gulp       = require('gulp');
const coffee     = require('gulp-coffee');
const concat     = require('gulp-concat');
const sass       = require('gulp-sass');
const declare    = require('gulp-declare');
const handlebars = require('gulp-handlebars');
const wrap       = require('gulp-wrap');

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

gulp.task('handlebars', () => {
    gulp
        .src([
            './data/handlebars/*.hbs'
        ])
        .pipe(handlebars({
            handlebars: require('handlebars')
        }))
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(declare({
            namespace: 'Handlebars.templates',
            noRedeclare: true
        }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('./data/build'));
});

gulp.task('watch', () => {
    gulp.watch('./data/coffee/**/*.coffee', ['coffee']);
    gulp.watch('./data/sass/**/*.scss', ['sass']);
    gulp.watch('./data/handlebars/**/*.hbs', ['handlebars']);
});

gulp.task('default', ['coffee', 'sass', 'handlebars']);