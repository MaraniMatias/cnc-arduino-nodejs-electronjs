module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  
  grunt.registerTask('help', 'Listado de comandos.', function() {
      grunt.log.subhead("Pre-Requisitos si vas a crear los instaladores.");
      grunt.log.subhead("En OS X, via Homebrew.");
      grunt.log.writeln("brew install wine makensis");
      grunt.log.subhead("En Ubuntu.");
      grunt.log.writeln("sudo add-apt-repository ppa:ubuntu-wine/ppa -y");
      grunt.log.writeln("sduo apt-get update");
      grunt.log.writeln("sudo apt-get install wine nsis -y");
      
      grunt.log.subhead("Instalar globalmente para desarollo.");
      grunt.log.writeln("sudo npm install -g grunt-cli");
      grunt.log.writeln("sudo npm install -g electron-prebuilt");
      grunt.log.writeln("sudo npm install -g mocha");

      grunt.log.subhead("Opcional packager-> complia para hacer ejecutable.");
      grunt.log.writeln("sudo npm install -g electron-packager");
      grunt.log.subhead("Opcional builder-> crear instalador para Windows, OS X (osx no me funciono).");
      grunt.log.writeln("sudo npm install -g electron-builder");
      
      grunt.log.subhead(this.name + " Usar grunt tarea:arg1:arg2:argN");
      
      grunt.log.subhead("grunt npm");
      grunt.log.error("Instala globales");
      
      grunt.log.subhead("grunt");
      grunt.log.writeln("Corre test y despues la app.");
      grunt.log.writeln("Correr la app manualmente 'electron app'");
      
      grunt.log.subhead("grunt bulid:arg1:arg2");
      grunt.log.writeln("Compilado de la app en ./build");
      grunt.log.writeln("arg1","win","osx","linux");
      grunt.log.writeln("arg2","64","32");
      grunt.log.writeln("Para osx arg2 no se toma encuenta.");
      
      grunt.log.subhead("grunt pack:arg1");
      grunt.log.writeln("Crea instalador para la app en './build' usando archivo de config builder-config.json");
      grunt.log.writeln("arg1","64","32");
      grunt.log.writeln("Por ahora solo para Windows.");
  
      grunt.log.subhead("grunt clean");
      grunt.log.error("Limpiar.","rm -rf ./build");
  });

  grunt.registerTask('pack', 'Compilado.', function(arch) {
    grunt.log.writeln("Instalador para windows","Arquitectura:",arch);
    switch (arch) {
    case "64":
      grunt.task.run('shell:compilado:win32:x64');
      grunt.task.run('shell:instalador:x64');
    break;
    case "32":
      grunt.task.run('shell:compilado:win32:ia32');
      grunt.task.run('shell:instalador:ia32');
    break;
    default:
      grunt.log.error('Arquitectura: 32 , 64 ');
    break;
    }
  });//pack
    
  grunt.registerTask('build', 'Compilado.', function(platform,arch) {
    grunt.log.writeln("Plataforma:",platform,"Arquitectura:",arch);
    // compilado      
    switch (platform) {
      case 'win':
        if(arch==='32') grunt.task.run('shell:compilado:win32:ia32');
        if(arch==='64') grunt.task.run('shell:compilado:win32:x64');
        break;
      case 'linux':
        if(arch==='32') grunt.task.run('shell:compilado:linux:ia32');
        if(arch==='64') grunt.task.run('shell:compilado:linux:x64');
        break;
      case 'osx':
          grunt.task.run('shell:compilado:darwin:all');
        break;
      default:
        grunt.log.error('Plataforma: win, linux, osx. \nArquitectura: 64 o 32. ');
        break;
    }
  });//build

  grunt.initConfig({
    shell: {
       instalador:{
         options: {
            execOptions: {
                maxBuffer: 1024 * 1024 * 64,
            },
        },
        command: function (arch) { //ia32 x64
                    return 'electron-builder build/Mercadear-win32-'+arch+'  --platform=win --out=build --config=builder-config.json';
                }
       },// instalador
       compilado:{
        options: {
            execOptions: {
                maxBuffer: 1024 * 1024 * 64,
            },
        },
        command: function (platform,arch) { // compilado darwin win3 linux ia32 x64 all
                    return 'electron-packager ./app Mercadear --platform='+platform+' --arch='+arch+' --version=0.36.1 --overwrite=true --out=build --icon=app/recursos/icon.ico --ignore=bower.json --ignore=views --ignore=tests';
                }
       },// compilado
      electron: {command: 'electron app'}
    },
    jshint: {
      all: ['Gruntfile.js', 'js/**/*.js', 'tests/**/*.js'],
      options: {
        globals: {
          console: true,
          module: true,
          jQuery: true
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
          cwd: "app/views",
          src: "**/*.jade",
          dest: "app/html",
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
        src: ['app/tests/**/*.js']
      }
    },
    docco: {
      debug: {
        src: ['app/index.js','app/tests/**/*.js','app/js/**/*.js'],
        options: {
          output: 'docs/'
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-docco');
  grunt.registerTask('default', ['jshint','jade','mochaTest','docco','shell:electron']);

};
