module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        test: {
            files: ['test/**/*.js']
        },

        lint: {
            files: ['grunt.js', 'tasks/**/*.js', 'test/**/*.js']
        },

        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true,
                es5: true
            }
        },

        context: {
            development: {
                options: {
                    jshint: {
                        options: {
                            eqeqeq:false
                        }
                    }
                }
            },
            production: {
                options: {
                    jshint: {
                        options: {
                            eqeqeq:true
                        }
                    }
                }
            }
        }

    });

    // Load local tasks.
    grunt.loadTasks('tasks');

    // Default task.
    grunt.registerTask('default', 'lint test');

};
