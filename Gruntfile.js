module.exports = (grunt) => {
  const
    path = require('path'),
    appPath = './app',
    outPath = './dist',
    electronPath = './node_modules/.bin/electron',
    electronPackagerPath = './node_modules/.bin/electron-packager',
    nodePreGypPath = appPath+'/node_modules/serialport/node_modules/node-pre-gyp/bin/node-pre-gyp',
    iconPath = appPath+'/recursos/icon'
  ;
  require('load-grunt-tasks')(grunt);
  
  grunt.initConfig({
    pckg : grunt.file.readJSON('./package.json') ,
    shell: {
      ebuild : {
        // platform ["mac", "osx", "win", "linux", "darwin", "win32", "all"]
        // arch ["ia32", "x64", "all"]
        command : (platform,arch) =>  { 
          return [path.resolve("./node_modules/.bin/build"),path.resolve("./dist/CNC-ino-win32-x64"),"--platform="+platform,"--arch="+arch,"--dir="+path.resolve("./dist")].join(' ')
        }
      },
      rebuidsp : {
        command : ["cd",path.resolve(appPath+"/node_modules/serialport"),"&&",path.resolve(nodePreGypPath),"rebuild --target=<%=pckg.devDependencies['electron-prebuilt']%> --dist-url=https://atom.io/download/atom-shell"].join(' ')
      },
      erun : {
        command : [path.resolve(electronPath),path.resolve(appPath)].join(' ')
      },
      epack: { 
        command : (platform,arch) =>  { 
          return [path.resolve(electronPackagerPath),path.resolve(appPath),grunt.file.readJSON(path.resolve(appPath+'/package.json')).productName,"--platform="+platform,"--arch="+arch,"--out="+path.resolve(outPath),"--overwrite","--icon="+path.resolve(iconPath)].join(' ');
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js','./app/app.js','./app/lib/**/*.js','./app/js/**/*.js', 'tests/**/*.js'],
      options: {
        globals: {
          console : true,
          module  : true,
          jQuery  : true,
          window  : true,
          angular : true
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
          src: ["**/*.jade", "!**/old/*.jade"],
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
      files: ['<%= jade.files %>','./views/**/*'],
      tasks: ['jade']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');

//  grunt.registerTask('default', ['jshint','jade','docco-plus','shell:erun']);
  grunt.registerTask('default', ['jshint','jade','shell:erun']);

  grunt.registerTask('test'     , ['jshint','mochaTest']);
  grunt.registerTask('run'      , ['jade','shell:erun']);
  grunt.registerTask('buildsp'  , ['shell:rebuidsp']);
  grunt.registerTask('pack'     , ['jade','shell:epack:win32:x64']);
//  grunt.registerTask('build'    , ['jade','shell:ebuild:win32:x64']);
};