'use strict';

const Util = require('../../src/util/util.js');

describe('tests utility functions', function()
{
    describe('mapProp', function()
    {
        it('returns a new array with the results of calling the given function \
            on every property of the given object', function()
        {
            const mockObj = { a: 1, foo: 'bar' };
            const mockFunc = (key, val, index, obj) => 'whatever';

            Util.mapProp(mockObj, mockFunc).should.eql([ 'whatever', 'whatever' ]);
        });
    });
});

