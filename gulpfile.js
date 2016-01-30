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
  mocha         = require('gulp-mocha'),
  filePackage   = require('./app/package.json'),
  fileConfig    = require('./gulp-builder-config.json');
  
// create the gulp task
gulp.task('templates', () => {
  var YOUR_LOCALS = {
    motorXY : {
      time:24,
      steps:10000,
      advance:115.47
    }
  };
  gulp.src('./views/**/*.jade')
    .pipe(jade({
      //client: true, // js
      locals: YOUR_LOCALS
    }))
    .pipe(gulp.dest('./app/html/'))
});

gulp.task('jsonedit', () => {
  const filename = './gulp-builder-config.json';
  fs.readFile(filename, (err, data) => {
    if (err) throw err;
    var json = JSON.parse(data.toString());
    json.app.version = filePackage.version;
    json.win.title   = json.app.name;
    json.osx.title   = json.app.name;
    json.win.version = filePackage.version;
    fs.writeFile(filename, JSON.stringify(json), (err) => {
      if (err) throw err;
        console.log('It\'s saved!');
      });
  });
});

gulp.task('run',['templates'], () => {
  childProcess.spawn(electron, ['./app'], { stdio: 'inherit' }); 
});

gulp.task('debug', () => { 
  childProcess.spawn(electron, ['--debug=5858','./app'], { stdio: 'inherit' }); 
}); 

gulp.task('lint', () => {
  gulp.src(['gulp-builder-config.json','gulp-config.js','gulpfile.js','app/**/*.js', '!node_modules/**/*.js','!app/node_modules/**/*.js','!app/components/**/*.js'])
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

gulp.task('default',['lint','jsonedit','templates','test','docu','run'], () => {

});

gulp.task('pack', () => {

  fs.exists(`./build/${fileConfig.app.name}-win32-ia32`, (exists) => {
    if(exists){
      console.log(`\tCreando instalador de ${fileConfig.app.name}-win32-ia32.`.underline);
      childProcess.spawn('electron-builder', [`./build/${fileConfig.app.name}-win32-ia32`,'--platform=win','--out=build/win32','--config=gulp-builder-config.json'], { execOptions: { maxBuffer: 1024 * 1024 * 64 } })
    }
  });
  
  fs.exists(`./build/${fileConfig.app.name}-win32-x64`, (exists) => {
    if(exists){
      console.log(`\tCreando instalador de ${fileConfig.app.name}-win32-x64.`.underline);
      childProcess.spawn('electron-builder', [`./build/${fileConfig.app.name}-win32-x64`,'--platform=win','--out=build/win64','--config=gulp-builder-config.json'], { execOptions: { maxBuffer: 1024 * 1024 * 64 } })
    }
  });
  
  fs.exists(`./build/${fileConfig.app.name}-darwin-x64`, (exists) => {
    if(exists){
      console.log(`\tCreando paquete de ${fileConfig.app.name}-darwin-x64.`.underline);
      childProcess.spawn('electron-builder', [`./build/${fileConfig.app.name}-darwin-x64`,'--platform=osx','--out=build/','--config=gulp-builder-config.json'], { execOptions: { maxBuffer: 1024 * 1024 * 64 } })
    }
  });
    
  fs.exists(`./build/${fileConfig.app.name}-linux-ia32`, (exists) => {
    if(exists){
      console.log(`\tCreando paquete de ${fileConfig.app.name}-linux-ia32.`.underline);
      gulp.src(`./build/${fileConfig.app.name}-linux-ia32/**/*`).pipe(zip.dest(`./build/${fileConfig.app.name}-linux-ia32.zip`));
    }
  });
  
  fs.exists(`./build/${fileConfig.app.name}-linux-x64`, (exists) => {
    if(exists){
      console.log(`\tCreando paquete de ${fileConfig.app.name}-linux-x64.`.underline);
      gulp.src(`./build/${fileConfig.app.name}-linux-x64/**/*`).pipe(zip.dest(`./build/${fileConfig.app.name}-linux-x64.zip`));
    }
  });
  
});

gulp.task('build', () => {
  const opts =   {
    platform : os.platform(),
    arch : os.arch(),
    dir  : './app',
    icon : './app/recursos/icon',
    name : fileConfig.app.name,
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
    name : fileConfig.app.name,
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
  console.log("\tCrea instalador para la app en './build' usando archivo de config gulp-builder-config.json");

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
