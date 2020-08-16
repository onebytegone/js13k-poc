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
            files: [],
         },
      },

      htmlmin: {
         main: {
            options: {
               removeComments: true,
               collapseWhitespace: true,
            },
            files: {
               'dist/index.html': 'src/index.html',
            },
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
   grunt.loadNpmTasks('grunt-contrib-htmlmin');
   grunt.loadNpmTasks('grunt-contrib-watch');


   grunt.registerTask('build', [ 'clean:dist', 'htmlmin:main' ]);
   grunt.registerTask('develop', [ 'build', 'watch' ]);
};
