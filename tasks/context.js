/*
 * grunt-context
 * https://github.com/indieisaconcept/grunt-context
 *
 * Copyright (c) 2012 "indieisaconcept" Jonathan Barnett
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

    // ==========================================================================
    // TASKS
    // ==========================================================================

    grunt.registerTask('context', 'Override config based on context', function(/* String */ context, /* String */ taskOrPlugin) {

        // ensure a context config exists
        this.requiresConfig(this.name + '.' + context);

        var _ = grunt.utils._,

            // task shortcuts
            name = this.name,
            label = name + '.' + context,
            helper = grunt.helper,

            // alias for accessing common context
            // items
            config = grunt.config(name)[context],
            tasks = config.task || {},
            plugins = config.plugin || {},

            // determine if we have a conflict as taskslists should not be
            // named the same as plugins
            taskList = taskOrPlugin && tasks[taskOrPlugin],
            taskPlugin = taskOrPlugin && (plugins[taskOrPlugin] || grunt.config(taskOrPlugin)),
            conflict = (!_.isUndefined(taskList) && !_.isUndefined(taskPlugin)),

            // gather current task including arguments
            // which may have been passed
            taskArgs = !conflict &&
                       taskPlugin &&
                       this.nameArgs.replace(label.replace('.', ':') + ':', '') || null, // [JB] could probably be neater

            // possible error scenarios
            msg = {
                'error': 'An error has occured',
                'conflict': 'Task list has the same name as a plugin',
                'tasklist': 'No valid tasklist found',
                'task': 'No valid task found',
                'nested': 'Nesting of ' + name + ' is currently not supported'
            },

            error,
            nested;

        // ensure that there is a fallback default task
        taskList = taskList || tasks['default'];

        // ensure that there in no nested context tasks
        nested = _.isString(taskList) && taskList.indexOf() !== -1 ? true : false;

        // a) conflict: task is the same name as a plugin or
        //    taskList: no task list defined including default
        //    taskPlugin: no task plugin defined

        invalid = (nested || conflict ||(_.isUndefined(taskList) && _.isUndefined(taskPlugin)));

        if (invalid) {

            // [JB] Clean this up ...
            error = !error && conflict && msg.conflict   || error;
            error = !error && nested && msg.nested       || error;
            error = !error && !taskList && msg.tasklist  || error;
            error = !error && !taskPlugin && msg.task    || error;
                
            // fallback
            error = error || msg.error;

            grunt.fatal(msg);

        // b) apply config overrides
        } else {

            grunt.log.writeln(grunt.utils.linefeed + label.toUpperCase() + ' OVERRIDE' + grunt.utils.linefeed);

            taskList = taskArgs && taskOrPlugin || taskList;

            // [JB] Consider moving this to earlier so that
            //      possible errors for pipleline are handled
            //      upfront.
            //
            // a) we have been passed a function
            //    iensure its called and apply any arguments which may
            //    have be passed
            if (_.isFunction(taskList)) {

                taskList.apply(this, _.rest(this.args, 2));

            // b) we'll explicity check for a sting, since
            //    support is only provided for functions or
            //    strings
            } else if (_.isString(taskList)) {

                taskList.split(/[,\s]+/).forEach(function (task) {

                    // ensure the plugin name is obtained with the arguments ommitted
                    var plugin = task.split(':')[0],
                        pluginConfig = plugins[plugin],

                        mainConfig = grunt.config(plugin),
                        status = '[SKIP]',

                        override;

                    // a) override the main config for the
                    //    plugin with the current context
                    //    config
                    if (pluginConfig) {

                        if (mainConfig) {

                            status = '[DONE]';
                            pluginConfig = helper('propertyOverride')(pluginConfig, mainConfig);

                        }

                        // promote this to be the main config for
                        // this plugin
                        grunt.config(plugin, pluginConfig);

                    }

                    grunt.log.writeln('> ' + status + ' ' + plugin);

                });

                taskList = taskArgs || taskList;

                // run the current taskList or plugin task
                grunt.task.run(taskList);

            }

        }

    });

    // ==========================================================================
    // HELPERS
    // ==========================================================================

    grunt.registerHelper('propertyOverride', function( /* Object */ source, /* Object */ data) {

        var namespace = grunt.utils.namespace,
            keys = [];

        [source, data].forEach(function(currentSource) {

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
        keya = _.uniq(keys);

        // override the individual configuration values
        keys.forEach(function(prop) {

            var overrideValue = namespace.get(data, prop);

            // only override if a value exists
            if (overrideValue) {
                namespace.set(source, prop, overrideValue);
            }

        });

        return source;

    });

};
