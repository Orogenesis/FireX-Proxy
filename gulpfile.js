const gulp           = require('gulp');
const coffee         = require('gulp-coffee');
const concat         = require('gulp-concat');
const sass           = require('gulp-sass');
const declare        = require('gulp-declare');
const handlebars     = require('gulp-handlebars');
const wrap           = require('gulp-wrap');
const zip            = require('gulp-zip');
const mainBowerFiles = require('main-bower-files');

gulp.task('coffee', () => {
    return gulp
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
    return gulp
        .src([
            './data/sass/**/*.scss'
        ])
        .pipe(sass())
        .pipe(gulp.dest('./data/build'));
});

gulp.task('handlebars', () => {
    return gulp
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

gulp.task('bower', ['bower-js', 'bower-css', 'bower-flags']);

gulp.task('bower-js', () => {
    return gulp
        .src(mainBowerFiles("**/*.js"))
        .pipe(gulp.dest('./data/build/libs'));
});

gulp.task('bower-css', () => {
    return gulp
        .src(mainBowerFiles("**/*.css"))
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest('./data/build/libs'));
});

gulp.task('bower-flags', () => {
    return gulp
        .src('./data/bower/flag-icon-css/flags/**/*')
        .pipe(gulp.dest('./data/build/flags'));
});

gulp.task('copy-polyfill', () => {
    return gulp
        .src('node_modules/webextension-polyfill/dist/browser-polyfill.js')
        .pipe(gulp.dest('addon'));
});

gulp.task('build:chrome', ['bower'], () => {
    return gulp
        .src([
            'addon/*.js',
            'addon/pac/chrome.dat',
            'popup/*',
            'welcome/*',
            'manifest.json',
            'data/icons/*',
            'data/fonts/*',
            'data/build/**/*',
            '_locales/**/*'
        ], {
            base: './'
        })
        .pipe(zip(`firex-proxy-chrome.zip`))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build:firefox', ['bower'], () => {
    return gulp
        .src([
            'addon/*.js',
            'addon/pac/firefox.js',
            'popup/*',
            'welcome/*',
            'manifest.json',
            'data/icons/*',
            'data/fonts/*',
            'data/build/**/*',
            '_locales/**/*'
        ], {
            base: './'
        })
        .pipe(zip(`firex-proxy-firefox.xpi`))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['build:firefox','build:chrome']);
gulp.task('watch', () => {
    gulp.watch('./data/coffee/**/*.coffee', ['coffee']);
    gulp.watch('./data/sass/**/*.scss', ['sass']);
    gulp.watch('./data/handlebars/**/*.hbs', ['handlebars']);
});

gulp.task('default', ['coffee', 'sass', 'handlebars', 'bower', 'copy-polyfill']);
