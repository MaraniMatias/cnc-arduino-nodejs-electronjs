// get the dependencies
const 
  fs            = require('fs'),
  os            = require('os'),
  colors        = require('colors'), 
  gulp          = require('gulp'),
  childProcess  = require('child_process'), 
  electron      = require('electron-prebuilt'),
  electronPack  = require('electron-packager'),
  jade          = require('gulp-jade'),
  jshint        = require('gulp-jshint'),
  docco         = require("gulp-docco"),
  zip           = require('gulp-vinyl-zip'),
  mocha         = require('gulp-mocha');
  
// create the gulp task
gulp.task('run', () => {
  childProcess.spawn(electron, ['./app'], { stdio: 'inherit' }); 
});

gulp.task('debug', () => { 
  childProcess.spawn(electron, ['--debug=5858','./app'], { stdio: 'inherit' }); 
}); 

gulp.task('templates', () => {
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

gulp.task('docu', () => {
  //app/index.js','app/tests/**/*.js','app/js/**/*.js
  gulp.src(["./app/**/*.js", '!node_modules/**/*.js','!app/node_modules/**/*.js','!app/components/**/*.js'])
    .pipe(docco())
    .pipe(gulp.dest('./docs'))
});
 
gulp.task('test', () => {
	gulp.src('tests/**/*.js' , { read: false })
		.pipe(mocha({
      ignoreLeaks:true
    }))
		.once('error', () => {
			process.exit(1);
		})
		.once('end', () => {
			process.exit();
		});
});

gulp.task('default',['run'], () => {
  
});

gulp.task('pack', () => {

  fs.exists('./build/CNCino-win32-ia32', (exists) => {
    if(exists){
      console.log('\tCreando instalador de CNCino-win32-ia32.'.underline);
      childProcess.spawn('electron-builder', ['./build/CNCino-win32-ia32','--platform=win','--out=build','--config=builder-config.json'], { execOptions: { maxBuffer: 1024 * 1024 * 64 } })
      .stdout.on('data', (data) => {
        console.log(data);
      });
    }
  });
  
  fs.exists('./build/CNCino-win32-x64', (exists) => {
    if(exists){
      console.log('\tCreando instalador de CNCino-win32-x64.'.underline);
      childProcess.spawn('electron-builder', ['./build/CNCino-win32-x64','--platform=win','--out=build','--config=builder-config.json'], { execOptions: { maxBuffer: 1024 * 1024 * 64 } })
    }
  });
  
  fs.exists('./build/CNCino-darwin-x64', (exists) => {
    if(exists){
      console.log('\tCreando paquete de CNCino-darwin-x64.'.underline);
      childProcess.spawn('electron-builder', ['./build/CNCino-darwin-x64','--platform=osx','--out=build','--config=builder-config.json'], { execOptions: { maxBuffer: 1024 * 1024 * 64 } })
    }
  });
    
  fs.exists('./build/CNCino-linux-ia32', (exists) => {
    if(exists){
      console.log('\tCreando paquete de CNCino-linux-ia32.'.underline);
      gulp.src('./build/CNCino-linux-ia32/**/*').pipe(zip.dest('./build/CNCino-linux-ia32.zip'));
    }
  });
  
  fs.exists('./build/CNCino-linux-x64', (exists) => {
    if(exists){
      console.log('\tCreando paquete de CNCino-linux-x64.'.underline);
      gulp.src('./build/CNCino-linux-x64/**/*').pipe(zip.dest('./build/CNCino-linux-x64.zip'));
    }
  });
  
});

gulp.task('build', () => {
  const opts =   {
    platform : os.platform(),
    arch : os.arch(),
    dir  : './app',
    icon : './app/recursos/icon',
    name : 'CNCino',
    ignore : 'bower.json',
    out : 'build',
    //version : '0.36.6', // version electron
    overwrite : true
  };
  electronPack(opts, (err, appPath) => { 
    if(err){console.log(err.red())}
    console.log(colors.green(appPath));
  });
});


gulp.task('build:all', () => {
  const opts =   {
    platform : 'all',
    arch : 'all',
    dir  : './app',
    icon : './app/recursos/icon',
    name : 'CNCino',
    ignore : 'bower.json',
    out : 'build',
    overwrite : true
  };
  electronPack(opts, (err, appPath) => { 
    if(err){console.log(err.red())}
    console.log(colors.green(appPath));
  });
});

gulp.task('help', () => {
  console.log("Pre-Requisitos si vas a crear los instaladores.".underline);
  console.log("\tEn OS X, via Homebrew.".bold);
  console.log("\tbrew install wine makensis");
  console.log("\tEn Ubuntu.".bold);
  console.log("\t\tsudo add-apt-repository ppa:ubuntu-wine/ppa -y");
  console.log("\tsduo apt-get update");
  console.log("\tsudo apt-get install wine nsis -y");

  console.log("\nInstalar globalmente para desarollo.".underline);
  console.log("\tsudo npm install -g gulp");
  console.log("\tsudo npm install -g mocha");
  console.log("\nOpcional builder-> crear instalador para Windows, OS X (osx no me funciono).".underline);
  console.log("\tsudo npm install -g electron-builder");

  console.log("\ngulp".underline);
  console.log("\tCorre test y despues la app.");

  console.log("\ngulp bulid".underline);
  console.log("\tCompilado de la app para sus plataforma en ./build");

  console.log("\ngulp pack".underline);
  console.log("\tCrea instalador para la app en './build' usando archivo de config builder-config.json");

  console.log("\ngulp clean");
  console.log("\tLimpiar.","rm -rf ./build".red);
});

gulp.task('clean', () => { 
  childProcess.spawn('rm', ['-rf ','./build'], { stdio: 'inherit' }); 
}); 

/*
var git = require('gulp-git');
gulp.task('st', function(){
  git.status({args: '--porcelain'}, function (err, stdout) {
    console.log(stdout);
    if (err) throw err;
  });
});

gulp.task('watch', function () {
  gulp.watch(paths.js, ['default'])
})
*/
