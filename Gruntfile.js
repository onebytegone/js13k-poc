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

   });

   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-copy');

   grunt.registerTask('build', [ 'clean:dist', 'copy:main' ]);
};
