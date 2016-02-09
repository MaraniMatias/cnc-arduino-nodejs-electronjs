const
  dirConfig     = './task-builder-config.json', 
  fs            = require('fs'),
  os            = require('os'),
  childProcess  = require('child_process'), 
  filePackage   = require('./app/package.json'),
  fileConfig    = require(dirConfig),
  electronPack  = require('electron-packager')
//  electron      = require('electron-prebuilt')
;
module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt);
  
  grunt.registerTask('help', 'List of commands.', () => {
      grunt.log.subhead("Prerequisites if you're creating installers.");
      grunt.log.subhead("In OS X, via Homebrew.");
      grunt.log.writeln("brew install wine makensis");
      grunt.log.subhead("In Ubuntu.");
      grunt.log.writeln("sudo add-apt-repository ppa:ubuntu-wine/ppa -y");
      grunt.log.writeln("sduo apt-get update");
      grunt.log.writeln("sudo apt-get install wine nsis -y");
      
      grunt.log.subhead("Install globally for development.");
      grunt.log.writeln("sudo npm install -g grunt-cli");
      //grunt.log.writeln("sudo npm install -g electron-prebuilt");
      grunt.log.writeln("sudo npm install -g mocha");

      //grunt.log.subhead("Opcional packager-> complia para hacer ejecutable.");
      //grunt.log.writeln("sudo npm install -g electron-packager");
      //grunt.log.subhead("Optional builder -> create installer for Windows, OSX.");
      //grunt.log.writeln("sudo npm install -g electron-builder");
      
      grunt.log.subhead(`${this.name} Use grunt task:arg1:arg2:argN`);
      
      
      grunt.log.subhead("grunt");
      grunt.log.writeln("Runs 'test' 'compiled java' 'creates documentation' 'runs the application'");
      
      grunt.log.subhead("grunt bulid:arg1:arg2");
      grunt.log.writeln("Compiled from the app ni ./build");
      grunt.log.writeln("arg1 all win32 linux darwin");
      grunt.log.writeln("arg2 all x64 ia32");
      grunt.log.writeln("To osx argument 'arg2' is not taken intoaccount.");
      
      grunt.log.subhead("grunt pack:arg1,arg2");
      grunt.log.writeln("Create installer for the app in './build' config file using task-builder-config.json");
      grunt.log.writeln("arg1 all win32 linux darwin");
      grunt.log.writeln("arg2 all x64 ia32");
      grunt.log.writeln("Windows installer and zip for linux");
  
      grunt.log.subhead("grunt clean");
      grunt.log.error("Clean.","rm -rf ./build");
  });

  grunt.registerTask('build', 'Compiled.', (platform,arch) => {
    grunt.log.writeln(`Compiled for ${fileConfig.app.name}-${platform}-${arch} in "./build".`);
        grunt.task.run(`electron-packager:build:${platform}:${arch}`);
  });//build
  
  grunt.registerTask('pack', 'Packaging or Windows installer.', (platform,arch) => {
    grunt.log.writeln('Create installer for compilations in "./build/ins".');
      /**
       * Por mejorar !!!
       */
      if( ['win','win32'].includes(platform) && ['ia32','x64'].includes(arch) ){
        grunt.task.run('shell:installer:win:'+arch);
      }else 
      if( ['osx','darwin'].includes(platform) && ['ia32','x64'].includes(arch) ){
         grunt.task.run('shell:installer:osx:'+arch);
      }else 
      if( ['linux32','linux'].includes(platform) && ['ia32','x64'].includes(arch)  ){
         grunt.task.run('electron-debian-installer:linux'+arch);
      }else 
      if('all'==platform){
        if('ia32'==arch){
          grunt.task.run('shell:installer:win:ia32');
          grunt.task.run('shell:installer:osx:ia32');
          grunt.task.run('electron-debian-installer:linuxia32');
        }
        if('x64'==arch){
          grunt.task.run('shell:installer:win:x64');
          grunt.task.run('shell:installer:osx:x64');
          grunt.task.run('electron-debian-installer:linuxx64');
        }
        if('all'==arch){
          grunt.task.run('shell:installer:win:ia32');
          grunt.task.run('shell:installer:osx:ia32');
          grunt.task.run('shell:installer:win:x64');
          grunt.task.run('shell:installer:osx:x64');
          grunt.task.run('electron-debian-installer:linuxia32');
          grunt.task.run('electron-debian-installer:linuxx64');
        }
      }else{
        throw new Error(' platform [linux32,linux,win,win32,osx,darwin] \n arch [x64,ia32]');
      }
  });//pack


  grunt.initConfig({
    zip: {
      linuxx64: {
        src: `./build/${fileConfig.app.name}-linux-x64/**/*`,
        dest: `./build/${fileConfig.app.name}-linux-x64.zip`
      },
      linuxia32: {
        src: `./build/${fileConfig.app.name}-linux-ia32/**/*`,
        dest: `./build/${fileConfig.app.name}-linux-ia32.zip`
      }
    },
    shell: {
      installer:{
        options: { execOptions: { maxBuffer: 1024 * 1024 * 64 } },
        command: (platform,arch) => { // win osx , ia32 x64
          return `electron-builder ./build/${fileConfig.app.name}-${platform}-${arch} --platform=${platform} --out=build/ins/${arch} --config=${dirConfig}`
        }
      },
      electron: {command: './node_modules/.bin/electron app'}
    },
    jshint: {
      all: ['Gruntfile.js','./app/lib/**/*.js','./app/js/**/*.js', 'tests/**/*.js'],
      options: {
        globals: {
          console : true,
          module  : true,
          jQuery  : true,
          window  : true
        },
        reporter: require('jshint-stylish'),
        jshintrc: './.jshintrc'
      }
    }, 
    jade: {      
      compile: {
        options: {
          data: {
            client: false,
            pretty: true,
            timestamp: "<%= grunt.template.today() %>",
            debug: false
          }
        },
        files: [ {
          cwd: "./views",
          src: "**/*.jade",
          dest: "./app/html/",
          expand: true,
          ext: ".html"
        } ]
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['./tests/**/*.js']
      }
    },
    'docco-plus': {
      debug: {
        src: ['./tests/**/*.js','./app/app.js','./app/lib/**/*.js','./app/js/**/*.js','!node_modules/**/*.js','!app/node_modules/**/*.js','!app/components/**/*.js'],
        options: {
          output: 'docs/'
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>','./views/**/*','./app/js/**/*','./app/lib/**/*'],
      tasks: ['jshint','jade']
    },
    'electron-packager': {
			build: {
				options: (platform,arch) => {
          return {
            overwrite : true,
            platform  : platform,
            ignore    : 'bower.json',
            name      : fileConfig.app.name,
            arch      : arch,
            icon      : './app/recursos/icon',
            dir       : './app',
            out       : './build'         
          }
				}
			}
		},
    'electron-debian-installer': {
      options: {
        productName: fileConfig.app.name,
        productDescription: 'package.json.des',
        section: 'devel',
        priority: 'package.json.propiedad',
        lintianOverrides: [],
        categories: ['Utility'],
        rename: function (dest, src) {
          return dest + fileConfig.app.name+'_<%= version %>-<%= revision %>_<%= arch %>.deb';
        }
      },
      linuxia32: {
        options: { arch: 'i386'},
        src: './build/'+fileConfig.app.name+'-linux-ia32',
        dest: './build/ins/'
      },
      linuxx64: {
        options: { arch: 'amd64'},
        src: './build/'+fileConfig.app.name+'-linux-x64',
        dest: './build/ins/'
      }
    }
  });
/*
  grunt.registerTask('electron', 'Electron.', () => {
    grunt.log.writeln(`Run electron ./app.`);
    childProcess.spawn(electron, ['./app'], { stdio: 'inherit' }); 
  });//run
*/
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-docco-plus');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-electron-packager');
  grunt.loadNpmTasks('grunt-electron-debian-installer');
  
  grunt.registerTask('default', ['jshint','jade',
  'mochaTest',
  'docco-plus',
  'shell:electron'
  ]);

};








