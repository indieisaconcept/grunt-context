var grunt = require('grunt');

exports.context = {

    setUp: function(done) {
        // setup here
        done();
    },

    'helper': function(test) {

        var altOverride = {},
            override = {

                lint: {
                    files: ['tasks/**/*.js']
                },

                jshint: {
                    options: {
                        curly: false,
                        eqeqeq: false,
                        immed: false,
                        latedef: false,
                        newcap: false,
                        noarg: false,
                        sub: false,
                        undef: false,
                        boss: false,
                        eqnull: false,
                        node: false,
                        es5: false
                    }
                }

            },

            tests,
            helperName = 'context',
            result = grunt.helper(helperName, override);

        // a) test normal object override
        Object.keys(override).forEach(function (key) {

            Object.keys(override[key]).forEach(function (key2) {
                test.deepEqual(result[key][key2], override[key][key2], 'should return the correct value.');
            });

        });

        // b) test argument override boolean
        result = grunt.helper(helperName, 'jshint.options.eqeqeq=false');
        test.deepEqual(result.jshint.options.eqeqeq, false, 'should return the correct value.');

        // c) test argument override array
        result = grunt.helper(helperName, "lint.files=['test/**/*.js']");
        test.deepEqual(result.lint.files, ['test/**/*.js'], 'should return the correct value.');

        // d) test argument override object
        result = grunt.helper(helperName, 'lint={}');
        test.deepEqual(result.lint, {}, 'should return the correct value.');

        test.done();

    }

};
