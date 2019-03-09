const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserSync = require('browser-sync').create();
const autoprefixer = require('autoprefixer');
const minimist = require('minimist');
const gulpSequence = require('gulp-sequence');

const envOptions = {
  default: { env: 'develop' },
};
const options = minimist(process.argv.slice(2), envOptions);

gulp.task('clean', () => {
  gulp.src('./dist', { read: false })
    .pipe($.clean());
});

gulp.task('pug', () => {
  gulp.src('./src/**/*.pug')
    .pipe($.plumber())
    .pipe($.pug({
      pretty: true,
    }))
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream());
});

gulp.task('scss', () => {
  const plugins = [
    autoprefixer({
      browsers: ['last 3 version', 'ie 6 - 8', 'iOS 8', 'Firefox > 20'],
    }),
  ];
  return gulp.src('./src/stylesheet/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: 'nested',
      includePaths: ['./node_modules/bootstrap/scss'],
    }).on('error', $.sass.logError))
    .pipe($.postcss(plugins))
    .pipe($.if(options.env === 'production', $.cleancss()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream());
});

gulp.task('js', () => {
  gulp.src('./src/js/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['@babel/env'],
    }))
    .pipe($.concat('all.js'))
    .pipe($.if(options.env === 'production', $.uglify({
      compress: {
        drop_console: true,
      },
    })))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browserSync.stream());
});

gulp.task('vendorJs', () => {
  gulp.src([
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
  ])
    .pipe($.concat('vendors.js'))
    .pipe($.if(options.env === 'production', $.uglify()))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
    reloadDebounce: 2000,
  });
});

gulp.task('images', () => {
  gulp.src('./src/images/*')
    .pipe($.if(options.env === 'production', $.imagemin()))
    .pipe(gulp.dest('./dist/images'));
});

gulp.task('watch', () => {
  gulp.watch('./src/**/*.pug', ['pug']);
  gulp.watch('./src/stylesheet/**/*.scss', ['scss']);
  gulp.watch('./src/js/**/*.js', ['js']);
});

gulp.task('deploy', () => {
  gulp.src('./dist/**/*')
    .pipe($.ghPages());
});

gulp.task('build', gulpSequence('clean', 'pug', 'scss', 'js', 'vendorJs', 'images'));

gulp.task('default', ['pug', 'scss', 'js', 'vendorJs', 'images', 'browser-sync', 'watch']);
