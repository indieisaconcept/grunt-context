var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['context'] = {

    setUp: function(done) {
        // setup here
        done();
    },

    'helper': function(test) {

        var destination = {
                prop1: 'some original value',
                prop2: 'some original value'
            },

            // apply these properties to the destination
            override = {
                prop1: 'some development value',
                prop3: 'some development value',
                prop4: 'some development value'
            },

            // merged result
            expected = {
                prop1: 'some development value',
                prop2: 'some original value',
                prop3: 'some development value',
                prop4: 'some development value'
            },

            keys = Object.keys(expected);

        result = grunt.helper('propertyOverride', destination, override);

        test.expect(keys.length);

        keys.forEach(function (key) {
            test.equal(result[key], expected[key], 'should return the correct value.');
        });

        test.done();
    }

};
