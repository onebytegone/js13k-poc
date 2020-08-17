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

      cssmin: {
         main: {
            files: {
               'dist/style.css': 'src/style.css',
            },
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

      terser: {
         main: {
            files: {
              'dist/index.js': [ 'src/index.js' ],
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
   grunt.loadNpmTasks('grunt-contrib-cssmin');
   grunt.loadNpmTasks('grunt-contrib-htmlmin');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-terser');

   grunt.registerTask('build', [ 'clean:dist', 'copy:main', 'terser:main', 'htmlmin:main', 'cssmin:main' ]);
   grunt.registerTask('develop', [ 'build', 'watch' ]);
};
