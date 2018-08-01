const gulp           = require('gulp');
const browserify     = require('browserify');
const coffee         = require('gulp-coffee');
const concat         = require('gulp-concat');
const sass           = require('gulp-sass');
const declare        = require('gulp-declare');
const handlebars     = require('gulp-handlebars');
const wrap           = require('gulp-wrap');
const zip            = require('gulp-zip');
const source         = require('vinyl-source-stream');
const mainBowerFiles = require('main-bower-files');
const exec           = require('child_process').exec;

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

gulp.task('bower', ['bower-js', 'bower-css']);

gulp.task('bower-js', () => {
    return gulp
        .src(mainBowerFiles("**/*.js"))
        .pipe(gulp.dest('./data/build/libs'));
});

gulp.task('bower-css', function () {
    return gulp.src(mainBowerFiles("**/*.css"))
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest('./data/build'));
});

gulp.task('build:firefox', ['pac', 'browserify', 'bower'], () => {
    return gulp
        .src([
            'addon/build/*.js',
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

gulp.task('watch', () => {
    gulp.watch('./data/coffee/**/*.coffee', ['coffee']);
    gulp.watch('./data/sass/**/*.scss', ['sass']);
    gulp.watch('./data/handlebars/**/*.hbs', ['handlebars']);
});

gulp.task('pac', () => {
    return gulp.src('addon/pac.js').pipe(gulp.dest('addon/build'));
});

gulp.task('browserify', ['pac', 'swagger'], () => {
    let b = browserify({
        entries: 'addon/background.js',
        debug: true
    });

    return b
        .bundle()
        .pipe(source('index.js'))
        .pipe(gulp.dest('./addon/build'));
});

gulp.task('swagger', (cb) => {
    return exec(['docker run --rm -v ' + process.cwd() + ':/local swaggerapi/swagger-codegen-cli generate',
        '    -i /local/xscraperapi/swagger.yml',
        '    -l javascript',
        '    -o /local/addon/generated/xscraper'].join(''), function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('default', ['browserify', 'coffee', 'sass', 'handlebars', 'bower']);
