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

context:*name*:*task*:*arguments*

+ name: The name of the context to use
+ task: A task for the context
+ arguments: The arguments to apply to the task if it's a function

### Overrides

Tasks you wish to provide a context for should be defined inside the context object and under the options key inside your main config. Properties for a specific task will then be combined with any defined outside of the context object.

Example grunt file with contexts defined:

```javascript
// ... grunt file contents

    // =====================
    // GLOBAL CONFIG
    // =====================

    sometask: {
        prop1: 'some original value',
        prop2: 'some original value'
    },

    context: {

        // =====================
        // CONFIG OVERRIDES
        // =====================

        development: {

            options: {

                sometask: {
                    prop1: 'some development value',
                    prop3: 'some development value',
                    prop4: 'some development value'
                }

            },

            tasks: {
                'default': 'sometask'
            }

        }

    }

// ... even more grunt file contents
```

The above configuration would result in the following config when grunt-context is run with the context set to "development".

```javascript
    sometask: {
        prop1: 'some development value',
        prop2: 'some original value'        
        prop3: 'some development value',
        prop4: 'some development value'
    },
```

Using the approach above you could also define the following tasks inside your grunt.js and when run the default task list for the context will run if it exists.

```javascript
    grunt.registerTask('default', 'context:development');
    grunt.registerTask('release', 'context:production');
```    

### Tasks

Tasks can also be defined against a context, in the same way in which you would normally use grunt.registerTask you can now directly associate tasks to a specific context.

```javascript
    tasks: {
        'default': 'sometask'
    },
```

When run any config options for the current context will be overriden. If a default task is found this will also be run.

To run the default task for a context, this is possible using the following syntax:

```
> grunt context:development or
> grunt content:development:default
```

## Typical Uses

Depending upon the tasks you are using and the options provided you could structure your grunt.js file so that you can:

+ Enable code profiling whilst actively developing but remove it when doing a build for release

```javascript
> grunt context:development requirejs

    // ... grunt file contents    

    requirejs: {

        js: {

            pragmas: {
                devExclude: false,
                profileExclude: false,
                remoteExclude: false
            }

        }

    }

    // ... grunt file contents    

> grunt context:production requirejs

    // ... grunt file contents    

    requirejs: {

        js: {

            pragmas: {
                devExclude: true,
                profileExclude: true,
                remoteExclude: true
            }

        }

    }

    // ... grunt file contents    

```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## Release History

### 0.2.0
+ Added support to propertyOverride helper to allow multiple overrides
+ Config overriding now based on the keys defined under context.name.options
+ Can now be run in conjuction with other tasks and still override configs
+ Added typical examples section to documentation

### 0.1.0
+ Initial Release

## License
Copyright (c) 2012 "indieisaconcept" Jonathan Barnett  
Licensed under the MIT license.