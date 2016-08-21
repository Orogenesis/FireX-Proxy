const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('compress', () => {
    return gulp.src('data/js/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('data/dist/js'));
});

gulp.task('copy', () => {
    return gulp.src('data/locale/**/*.js')
        .pipe(gulp.dest('data/dist/locale'));
});

gulp.task('default', ['compress', 'copy']);