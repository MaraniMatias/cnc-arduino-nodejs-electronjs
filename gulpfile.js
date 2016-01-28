// get the dependencies
const 
  gulp          = require('gulp'), 
  childProcess  = require('child_process'), 
  electron      = require('electron-prebuilt'),
  jade          = require('gulp-jade'),
  jshint = require('gulp-jshint');
 
// create the gulp task
gulp.task('run', function () { 
  childProcess.spawn(electron, ['./app'], { stdio: 'inherit' }); 
});

gulp.task('templates', function() {
  var YOUR_LOCALS = {
    motorXY : {
      time:24,
      steps:10000,
      advance:115.47
    }
  };
  gulp.src('./views/*.jade')
    .pipe(jade({
      //client: true, // js
      locals: YOUR_LOCALS
    }))
    .pipe(gulp.dest('./app/html/'))
});

gulp.task('jshint', () => {
  gulp.src(['app/**/*.js', '!node_modules/**/*.js','!app/node_modules/**/*.js','!app/components/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});