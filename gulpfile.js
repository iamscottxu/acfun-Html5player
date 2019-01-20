const gulp = require('gulp');
const browserify = require('browserify');
const uglify = require('gulp-uglify');
const source = require('vinyl-source-stream');
const babelify = require('babelify');
const rename = require("gulp-rename");
const header = require('gulp-header');
const fs = require('fs-extra');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const concat = require('gulp-concat');
const minifyCSS = require('gulp-minify-css');
const htmlmin = require('gulp-htmlmin');
const zip = require('gulp-zip');
const buildConfig = require('./build.json');

gulp.task('js_build', () => {
    buildConfig.buildDate = new Date().toUTCString();
    let license = fs.readFileSync('./LICENSE').toString();

    fs.writeJSONSync('src/build.json', buildConfig);

    return browserify({
        entries: 'src/app.js',
        debug: true
    })
        .transform(babelify, {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        useBuiltIns: 'usage'
                    }
                ]
            ],
            shouldPrintComment: (val) => /^\*/.test(val)
        })
        .bundle()
        .pipe(source(`${buildConfig.name}.all.js`))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(header('/*!\n${license}\nHome: ${home}\n*/\n', { license: license, home: buildConfig.home }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/chrome_debug/scripts'))
});

gulp.task('js_min', () => {
    return gulp.src(`dist/chrome_debug/scripts/${buildConfig.name}.all.js`)
        .pipe(uglify({
            compress: {
                passes: 10
            },
            output: {
                comments: '/^!/'
            }
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/chrome/scripts'))
        .pipe(gulp.dest('dist/firefox/scripts'))
});

gulp.task('css_min', () => {
    return gulp.src([
        'styles/**/*.css',
        'node_modules/perfect-scrollbar/css/**/*.css',
        'node_modules/tooltipster/dist/css/tooltipster.bundle.min.css'
    ])
        .pipe(concat(`${buildConfig.name}.all.min.css`))
        .pipe(minifyCSS())
        .pipe(gulp.dest('dist/chrome_debug/styles'))
        .pipe(gulp.dest('dist/chrome/styles'))
        .pipe(gulp.dest('dist/firefox/styles'))
});

gulp.task('html_min', () => {
    return gulp.src('htmls/**/*.html')
        .pipe(htmlmin())
        .pipe(gulp.dest('dist/chrome_debug/htmls'))
        .pipe(gulp.dest('dist/chrome/htmls'))
        .pipe(gulp.dest('dist/firefox/htmls'))
});

gulp.task('zip_chrome', () => {
    return gulp.src('dist/chrome/**/*.*')
        .pipe(zip('chrome.zip'))
        .pipe(gulp.dest('zip'))
});

gulp.task('zip_firefox', () => {
    return gulp.src('dist/firefox/**/*.*')
        .pipe(zip('firefox.zip'))
        .pipe(gulp.dest('zip'))
});

gulp.task('debug', gulp.parallel('js_build', 'css_min', 'html_min'));

gulp.task('default', gulp.series(gulp.parallel(gulp.series('js_build', 'js_min'), 'css_min', 'html_min'), gulp.parallel('zip_chrome', 'zip_firefox')));