# grunt-context

The aim of this plugin is to allow the grunt config to be overridden based on the current context selected. This is particularly useful if builds need to be tailored based upon the deployment environment.

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-context`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-context');
```

[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/cowboy/grunt/blob/master/docs/getting_started.md

## Documentation

### Usage

grunt-context supports arguments. The arguments are broken down as follows:

contenxt:name:task:arguments

+ name: The name context to use
+ task: A single task or tasklist to run
+ arguments: The arguments to apply to a single task, these are ignored when a task list is used.

### Overrides

Tasks you which to provide a context for should be defined inside the context object and under the options key inside your main config. Properties for a specific task will then be combined with any defined outside of the context object.

Example grunt file with contexts defined:

```javascript

// ... grunt file contents

    // =====================
    // GLOBAL CONFIG
    // =====================

    someplugin: {
        prop1: 'some original value',
        prop2: 'some original value'
    },

    context: {

        // =====================
        // CONFIG OVERRIDES
        // =====================

        development: {

            options: {

                someplugin: {
                    prop1: 'some development value',
                    prop3: 'some development value',
                    prop4: 'some development value'
                }

            },

            tasks: {
                'default': 'someplugin'
            }

        }

    }

// ... even more grunt file contents

```

The above configuration would result in the following config when grunt-context which the context set to "development" is run.

```javascript

    someplugin: {
        prop1: 'some development value',
        prop2: 'some original value'        
        prop3: 'some development value',
        prop4: 'some development value'
    },

```

### Tasks

Tasks can also be defined against a context, in the same way in which you would normally use grunt.registerTask you can now directly associate tasks to a specific context.

```javascript

    tasks: {
        'default': 'someplugin'
    },

```

A "default" task should always be defined as per normal grunt task convention.

To run the default task for a context, this is possible using the following syntax:

```
> grunt context:development or
> grunt content:development:default
```

This will either run a single task or either a task list.

*Note:* Ensure that you do not duplicate task names.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History

### 0.1.0
+ Initial Release

## License
Copyright (c) 2012 "indieisaconcept" Jonathan Barnett  
Licensed under the MIT license.