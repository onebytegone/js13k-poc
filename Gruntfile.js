'use strict';

module.exports = (grunt) => {
   let config;

   config = {
      out: {
         dist: './dist',
      },
   };

   grunt.initConfig({

      clean: {
         dist: config.out.dist,
      },

      copy: {
         main: {
            files: [
               { cwd: 'src', src: 'index.html', dest: config.out.dist, expand: true },
            ],
         },
      },

      watch: {
         scripts: {
            files: ['src/**/*'],
            tasks: [ 'build' ],
            options: {
               spawn: false,
            },
         },
       },

   });

   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-watch');

   grunt.registerTask('build', [ 'clean:dist', 'copy:main' ]);
   grunt.registerTask('develop', [ 'build', 'watch' ]);
};
