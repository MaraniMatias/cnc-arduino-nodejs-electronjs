module.exports = (grunt) => {
  const
    path = require('path'),
    appPath = './app',
    outPath = './dist',
    electronPath = './node_modules/.bin/electron',
    electronPackagerPath = './node_modules/.bin/electron-packager',
    node_modules = ['serialport', 'lwip'],
    iconPath = appPath + '/recursos/icon'
    ;
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pckg: grunt.file.readJSON('./package.json'),
    shell: {
      ebuild: {
        // platform ["mac", "osx", "win", "linux", "darwin", "win32", "all"]
        // arch ["ia32", "x64", "all"]
        command: (platform, arch) => {
          return [path.resolve("./node_modules/.bin/build"), path.resolve("./dist/CNC-ino-win32-x64"), "--platform=" + platform, "--arch=" + arch, "--dir=" + path.resolve("./dist")].join(' ')
        }
      },
      rebuidserialport: {
        command: ["cd", path.resolve(appPath + "/node_modules/" + node_modules[0]), "&&", "node-gyp rebuild --target=<%=pckg.devDependencies['electron-prebuilt']%> --dist-url=https://atom.io/download/atom-shell"].join(' ')
      },
      rebuidimg2gcode: {
        command: ["cd", path.resolve(appPath + "/node_modules/" + node_modules[1]), "&&", "node-gyp rebuild --target=<%=pckg.devDependencies['electron-prebuilt']%> --dist-url=https://atom.io/download/atom-shell"].join(' ')
      },
      erun: {
        command: [path.resolve(electronPath), path.resolve(appPath)].join(' ')
      },
      epack: {
        command: (platform, arch) => {
          return [path.resolve(electronPackagerPath), path.resolve(appPath), grunt.file.readJSON(path.resolve(appPath + '/package.json')).productName, "--platform=" + platform, "--arch=" + arch, "--out=" + path.resolve(outPath), "--overwrite", "--icon=" + path.resolve(iconPath)].join(' ');
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js', './app/app.js', './app/lib/**/*.js', './app/js/**/*.js', 'tests/**/*.js'],
      options: {
        globals: {
          console: true,
          module: true,
          jQuery: true,
          window: true,
          angular: true
        },
        reporter: require('jshint-stylish'),
        jshintrc: './.jshintrc'
      }
    },
    pug: {
      compile: {
        files: {
          './app/html/index.html': ['./views/main.pug']
        }
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
        src: ['./tests/**/*.js', './app/app.js', './app/lib/**/*.js', './app/js/**/*.js', '!node_modules/**/*.js', '!app/node_modules/**/*.js', '!app/components/**/*.js'],
        options: {
          output: 'docs/'
        }
      }
    },
    watch: {
      files: ['<%= pug.files %>', './views/**/*'],
      tasks: ['pug']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-pug');

  //  grunt.registerTask('default', ['jshint','pug','docco-plus','shell:erun']);
  grunt.registerTask('default', ['jshint', 'pug', 'shell:erun']);

  grunt.registerTask('test', ['jshint', 'mochaTest']);
  grunt.registerTask('run', ['pug', 'shell:erun']);
  grunt.registerTask('buildmodule', ['shell:rebuidserialport', 'shell:rebuidimg2gcode']);
  grunt.registerTask('pack', ['pug', 'shell:epack:win32:x64']);
  //  grunt.registerTask('build'    , ['pug','shell:ebuild:win32:x64']);
};