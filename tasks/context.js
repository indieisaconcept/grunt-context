/*
 * grunt-context
 * https://github.com/indieisaconcept/grunt-context
 *
 * Copyright (c) 2012 "indieisaconcept" Jonathan Barnett
 * Licensed under the MIT license.
 */
module.exports = function(grunt) {

    // ==========================================================================
    // GLOBAL
    // ==========================================================================

        // grunt shortcuts
    var utils = typeof grunt.utils !== 'undefined' ? grunt.utils : grunt.util,
        _ = utils._,
        namespace = utils.namespace,

        gruntTasks = grunt.task._tasks,
        gruntConfigs = grunt.config,

        // possible errors and the associated handler
        errors = {

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

        },

        // ==========================================================================
        // HELPER - LOCAL && EXTERNAL
        // ==========================================================================

        helper = {

            // localised functions only available with the context
            // of this task
            local: {

                // generic function to support the processing
                // of an error object
                error: function (/* Object */ currentError) {

                    var error = errors[currentError] || errors.general,
                        handler = error.handler || errors.general.handler,
                        message = error.message || errors.general.message,
                        code = error.code || errors.general.code;

                    handler = _.isString(handler) ? namespace.get(grunt, handler) : handler;

                    if (_.isFunction(handler)) {
                        handler(message, code);
                    }

                }

            },

            // external functions which are to be registered
            // as helper tasks outside
            external: {

                propertyOverride: function( /* Object */ source, /* Object */ data) {

                    var keys = [],
                        overrides = _.toArray(arguments).splice(1);

                    overrides.forEach(function(currentSource) {

                        (function constructPath(source, path) {

                            path = path || '';

                            _.forEach(source, function(value, key) {

                                var delim = (path && '.' || path);

                                if (_.isObject(value) && !_.isArray(value)) {
                                    constructPath(value, path + delim + key);
                                } else {
                                    keys.push(path + delim + key);
                                }

                            });

                        }(currentSource));

                    });

                    // remove duplicates
                    keys = _.uniq(keys);

                    // override the individual configuration values
                    keys.forEach(function(prop) {

                        overrides.forEach(function (data) {
     
                            var overrideValue = namespace.get(data, prop);

                            // only override if a value exists
                            if (!_.isUndefined(overrideValue)) {
                                grunt.log.verbose.writeln('> OVERRIDE ' + prop + ' => ' + overrideValue);
                                namespace.set(source, prop, overrideValue);
                            }

                        });

                    });

                    return source;

                }

            }

        };

    // make external helpers available outside of this
    // task
    _.forEach(helper.external, function (value, key) {
        
        if (_.isFunction(value)) {
            grunt.registerHelper(key, value);
        }

    });

    // ==========================================================================
    // TASKS
    // ==========================================================================

    grunt.registerTask('context', 'Override config based on context', function(/* String */ context, /* String */ task) {

        // ensure a context config exists
        this.requiresConfig(this.name + '.' + context);

            // task shortcuts
        var name = this.name,
            label = name + ':' + context,

            // alias for accessing common context
            // items
            contextConfig = grunt.config(name)[context],
            contextTasks  = contextConfig.tasks || {},
            contextOptions = contextConfig.options || {},

            // retrieve the current tasks for
            // the context if they exist
            taskList = task && contextTasks[task],
            fallback = taskList ? false : true,

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
            helper.local.error(error);
        }

        // apply config overrides
        grunt.log.verbose.writeln(grunt.utils.linefeed + label.toUpperCase() + ' OVERRIDE' + grunt.utils.linefeed);

        _.forEach(contextOptions, function (config, task) {

            // ensure the task name is obtained with the arguments ommitted
            var taskConfig = config,
                mainConfig = gruntConfigs(task),
                status = '[SKIP]',

                override;

            // a) override the main config for the
            //    task with the current context
            //    config
            if (taskConfig) {

                if (mainConfig) {

                    status = '[DONE]';
                    mainConfig = helper.external.propertyOverride(mainConfig, taskConfig);

                }

                // promote this to be the main config for
                // this task
                grunt.config(task, mainConfig);

            }

            grunt.log.verbose.writeln('> ' + status + ' ' + task);

        });

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

    });

};
