/*
 * grunt-context > grunt-config
 * https://github.com/indieisaconcept/grunt-context
 *
 * Copyright (c) 2012 "indieisaconcept" Jonathan Barnett
 * Licensed under the MIT license.
 */
module.exports = function(grunt) {

        // grunt shortcuts
    var utils = typeof grunt.utils !== 'undefined' ? grunt.utils : grunt.util,
        _ = utils._,
        namespace = utils.namespace,
        gruntTasks = grunt.task._tasks,

        // ==========================================================================
        // PLUGIN
        // ==========================================================================

        plugin = {

            name: 'context',

            description: 'Allow config values to be overriden during task execution',

            // possible errors and the associated handler
            errors: {

                handler: function (/* Object */ currentError) {

                    var defaultError = plugin.errors.type.general,
                        error = plugin.errors.type[currentError] || defaultError,
                        handler = error.handler || defaultError.handler,
                        message = error.message || defaultError.message,
                        code = error.code || defaultError.code;

                    handler = _.isString(handler) ? grunt[handler] : handler;

                    if (_.isFunction(handler)) {
                        handler(message, code);
                    }

                },

                types: {

                    general: {
                        message: 'An error has occured',
                        handler: 'fatal',
                        code: 1
                    },

                    nested: {
                        message: 'Nesting of contexts is not currently supported',
                        handler: 'warn',
                        code: 3
                    }

                }

            },

            // external helper which can be used by other
            // tasks
            helper: function(/* Object / String ... */ data) {

                var keys = [],
                    overrides = _.chain(arguments).toArray(arguments).flatten(arguments, true).value(),
                    process = grunt.config,
                    cliParam = /([^=]*?)=(.*)/;

                // a) check for arguments passed which could
                //    be config properties requiring override
                //
                //      grunt context:dev:some.prop=12345:some.prop.test=12345
                //
                // b) check for objects which have been passed
                //
                //      {
                //          jshint: {
                //              options: {
                //                  eqeqeq: false
                //              }
                //          }
                //      }

                overrides = _.filter(overrides, function (value) {
                    return (_.isString(value) && value.match(cliParam) || _.isObject(value)) ? true : false;
                });

                overrides.forEach(function(currentSource, index) {

                    var temp,
                        newOverride = {},
                        adhocOverride = _.isString(currentSource) &&
                                        currentSource.match(cliParam);

                    if (adhocOverride) {

                        // [JB] Not sure about this, could be problematic,
                        // maybe only allow strings to be replaced - revist
                        temp = (function (result) {

                            /*jshint evil:false */
                            // Inline jshint seem to be ignored, dont want to do
                            // it but Function > FN
                            
                            var Fn = Function;
                            
                            return new Fn('return (' + result + ');');

                        }(adhocOverride[2]));
                        
                        keys.push({
                            key: adhocOverride[1],
                            value: temp()
                        });

                    } else if (_.isObject(currentSource)) {

                        (function constructPath(source, path) {

                            path = path || '';

                            _.forEach(source, function(value, key) {

                                var delim = (path && '.' || path);

                                if (_.isObject(value) && !_.isArray(value)) {
                                    constructPath(value, path + delim + key);
                                } else {
                                    
                                    keys.push({
                                        key: path + delim + key,
                                        value: value
                                    });

                                }

                            });

                        }(currentSource));

                    }

                });

                keys.forEach(function (data) {
                    process.apply(null, _.values(data));
                });

                return grunt.config.get();

            },

            task: function(/* String */ context, /* String */ task) {

                    // task shortcuts
                var name = 'context',
                    label = name + ':' + context,

                    // alias for accessing common context
                    // items
                    contextConfig = context &&
                                    grunt.config(name) &&
                                    grunt.config(name)[context] || {},

                    contextTasks  = contextConfig.tasks || {},
                    contextOptions = contextConfig.options || {},

                    // retrieve the current tasks for
                    // the context if they exist
                    taskList = task && contextTasks[task],
                    fallback = taskList ? false : true,

                    overrides = [],
                    taskArgs = [],
                    error = false;

                // fallback to default task for context
                // if it exists
                taskList = taskList || contextTasks['default'];

                // gather current task arguments which
                // may have been passed, excluding context
                taskArgs = _.isFunction(taskList) && _.rest(this.args, fallback ? 1 : 2) || taskArgs;

                // prevent context nestings
                error = (_.isString(taskList) && taskList.indexOf(name + ':') !== -1) && 'nested';

                if (error) {
                    plugin.helper.local.error(error);
                }

                // apply config overrides
                grunt.log.verbose.writeln(grunt.utils.linefeed + label.toUpperCase() + ' OVERRIDE' + grunt.utils.linefeed);

                _.forEach(contextOptions, function (config, task) {

                    // ensure the task name is obtained with the arguments ommitted
                    var taskConfig = {},
                        status = '[SKIP]',

                        override;

                    // a) add/override the main config for the
                    //    task with the current context
                    //    config if it exists
                    if (config) {

                        status = '[DONE]';
                        taskConfig[task] = config;
                        overrides.push(taskConfig);

                    }

                    grunt.log.verbose.writeln('> ' + status + ' ' + task);

                });

                // apply any adhoc config overrides prior to calling
                // the taskList if it is a function or if a run task
                // is reqyuire
                
                // merge arguments passed to the task
                overrides = overrides.concat(this.args);

                if (overrides) {
                    plugin.helper(overrides);
                }

                // a) we have been passed a function
                //    iensure its called and apply any arguments which may
                //    have be passed
                if (_.isFunction(taskList)) {

                    taskList.apply(this, taskArgs);

                // b) we'll explicity check for a sting, since
                //    support is only provided for functions or
                //    strings
                } else if (_.isString(taskList)) {

                    // run the current taskList or task
                    grunt.task.run(taskList);

                }

            }

        };

    // ==========================================================================
    // REGISTER TASK + HELPER
    // ==========================================================================

    plugin.name.split(/[,\s]+/).forEach(function (name) {

        // task
        grunt.registerTask(name, plugin.description, plugin.task);
        // helper
        grunt.registerHelper(name, plugin.helper);

    });

};