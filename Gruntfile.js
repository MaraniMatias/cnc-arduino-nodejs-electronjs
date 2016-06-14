const
  appPath = './app',
  electronPath = './node_modules/.bin/electron',
  appPackage   = appPath+'/package.json'
;
module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt);
  
  grunt.registerTask('epack', 'Runig electron-packager.', () => {
    try {
      const platform = 'all', arch = 'all', overwrite = true, 
            pck =  grunt.file.readJSON(appPackage),
            icon = appPath+'./recursos/icon';
            
    } catch (error) {
      grunt.log.error(error);
    }
  });
  
  grunt.initConfig({
    /*einstaller  :  { // electron-bulider 
      options  :   {
        //platform  :  'all', // default all // win, osx, linux
        //arch      :  'all', // default all // ia32, am64, all
        //appPath   :  './app', // default ./app
        //basePath  :  './app', // default ./app // Path base for the file config.json 
        config    :   './task-builder-config.json', // default ./app/builder.json
        buildPath   :  './build', // default ./build
        out       :  './build/instaler'  // default ./dist
    }}*/
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
    shell: {
      erunwin : { command : 'electron .\\app' },
      erun : { command : `${electronPath} ${appPath}` },
      dist: { command : 'npm run dist'}
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
    }
  });
  
  grunt.registerTask('default', ['jshint','jade','mochaTest','docco-plus','erun']);
  grunt.registerTask('run', ['jade','shell:erun' ]);
  grunt.registerTask('runwin', ['jade','shell:erunwin' ]);
  
};