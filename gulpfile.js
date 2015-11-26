var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    jsonminify = require('gulp-jsonminify'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    gulpif = require('gulp-if');

var env,
    coffeeSources,
    jsSources,
    sassSources,
    htmlSources,
    jsonSources,
    outputDir;

env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    outputDir = 'builds/development/';
} else {
    outputDir = 'builds/production/';
}


htmlSources = [outputDir + '*.html'];
jsonSources = [outputDir + 'js/*.json'];
jsSources = [
    'components/scripts/rclick.js',
    'components/scripts/pixgrid.js',
    'components/scripts/tagline.js',
    'components/scripts/template.js'
];
coffeeSources = ['components/coffee/*.coffee'];
sassSources = ['components/sass/style.scss'];

gulp.task('coffee', function() {
    gulp.src('components/coffee/tagline.coffee')
        .pipe(coffee({
                bare: true
            })
            .on('error', gutil.log))
        .pipe(gulp.dest('components/scripts'));
});

gulp.task('js', function() {
    gulp.src(jsSources)
        .pipe(concat('script.js'))
        .pipe(browserify())
        .pipe(gulpif(env === 'production', uglify()))
        .pipe(gulp.dest(outputDir + 'js'))
        .pipe(connect.reload());
});

gulp.task('compass', function() {
    gulp.src(sassSources)
        .pipe(compass({
                sass: 'components/sass',
                image: outputDir + 'images',
                style: 'expanded'
            })
            .on('error', gutil.log))
        .pipe(gulp.dest(outputDir + 'css'))
        .pipe(connect.reload());
});

gulp.task('default', ['html', 'json', 'images', 'coffee', 'js', 'compass', 'connect', 'watch']);

gulp.task('watch', function() {
    gulp.watch(coffeeSources, ['coffee']);
    gulp.watch(jsSources, ['js']);
    gulp.watch('components/sass/*.scss', ['compass']);
    gulp.watch('builds/development/*.html', ['html']);
    gulp.watch('builds/development/js/*.json', ['json']);
    gulp.watch('builds/development/images/**/*.*', ['images']);
});

gulp.task('connect', function() {
    connect.server({
        root: outputDir,
        livereload: true
    });
});

gulp.task('html', function() {
    gulp.src('builds/development/*.html')
        .pipe(gulpif(env === 'production', minifyHTML()))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
        .pipe(connect.reload());
});

gulp.task('images', function () {
    gulp.src('builds/development/images/**/*.*')
        .pipe(gulpif(env === 'production', imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
        .pipe(connect.reload());
});

gulp.task('json', function() {
    gulp.src(jsonSources)
        .pipe(gulpif(env === 'production', jsonminify()))
        .pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
        .pipe(connect.reload());
});
