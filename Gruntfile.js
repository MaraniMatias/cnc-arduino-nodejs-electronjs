const
  dirConfig     = './task-builder-config.json', 
  fs            = require('fs'),
  os            = require('os'),
  childProcess  = require('child_process'), 
  filePackage   = require('./app/package.json'),
  fileConfig    = require(dirConfig)
//  electronPack  = require('electron-packager')
//  electron      = require('electron-prebuilt')
;
module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt);
  
  grunt.registerTask('fileConfig <- filePackage', 'List of commands.', () => {

  });

  grunt.initConfig({
    eplus  :  {
      run : { 
        options : {
          appPath  :  './app' // default '.'
        }
      },
      debug : { 
        options : {
          appPath  :  './app',  // default '.'
          debug : true,  // default false
          port  :  5858  // default 5858
        }
      }
    },
    ebuild : { // electron-packager
      default:{
        options: {
          //overwrite : true,     // default true
          //platform  : 'all',    // default all
          //arch      : 'all',    // default all
          //version   : '0.36.7', // default auto set
          //name    : 'Titule Electron app', // default (options.dir+'/packeger.json').name
          icon      : './app/recursos/icon',
          dir       : './app',   // default ./app
          out       : './build'  // default ./build
        }
      },
      custom:{
        options: (platform,arch) => {
          return {
            platform,
            arch,
            icon      : './app/recursos/icon'
          }
        }
      }
    },// ebuild
    einstaller  :  { // electron-bulider 
      options  :   {
        //platform  :  'all', // default all // win, osx, linux
        //arch      :  'all', // default all // ia32, am64, all
        //appPath   :  './app', // default ./app auto set
        //basePath  :  './app', // default ./app // Path base the file config.json 
        config    :   './task-builder-config.json', // default ./app/builder.json
        buildPath   :  './build', // default ./build
        out       :  './build/instaler'  // default ./dist
      },
      /*all  : {
        options  :  {
          platform  :  'all', 
          arch  :  'all'      
        }
      },*/
      win32:{
        options: {
          platform: 'win',
          arch : 'ia32',
          appPath   :  './CNC-ino-win32-ia32' // path  buildPath/appPath
        }
      },
      win64:{
        options: {
          platform: 'win',
          arch : 'x64',
          appPath   :  './CNC-ino-win32-x64' // path  buildPath/appPath
        }
      },
      /*osx:{ // Only with mac os machine.
        options: {
          platform: 'osx',
          //appPath   :  './CNC-ino-darwin-x64',
        }
      },*/
      linux64:{
        options: {
          platform : 'linux',
          arch : 'x64',
          appPath  :  './CNC-ino-linux-ia32'
        }
      },
      linux32:{
        options: {
          platform : 'linux',
          arch : 'ia32',
          appPath  :  './CNC-ino-linux-x64'
        }
      }
    },// einstaller
    /*
    zip: {
      linuxx64: {
        src: `./build/${fileConfig.app.name}-linux-x64/***`,
        dest: `./build/${fileConfig.app.name}-linux-x64.zip`
      },
      linuxia32: {
        src: `./build/${fileConfig.app.name}-linux-ia32/***`,
        dest: `./build/${fileConfig.app.name}-linux-ia32.zip`
      }
    },
    */
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
    }/*,
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
    }*/
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-docco-plus');
  //grunt.loadNpmTasks('grunt-zip');
  
  grunt.loadNpmTasks('grunt-electron-debian-installer');
  
  //grunt.loadNpmTasks('grunt-electron-packager-builder ');
    
  grunt.registerTask('default', ['jshint','jade',
  'mochaTest',
  'docco-plus',
  'eplus:run'
  ]);

};








