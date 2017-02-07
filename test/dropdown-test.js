'use strict';

const { makeActionObj, makeActions } = require('../src/components/dropdown/Dropdown.js');

describe('tests static functions of dropdown menu', function()
{
    describe('makeActionObj', function()
    {
        it('returns an object with two properties: "text" and "triggers"', function()
        {
            const mockText = 'foo';
            const mockTriggers = [ () => {}, () => {} ];
            const actionObj = makeActionObj(mockText, mockTriggers);

            actionObj.should.be.an.Object;
        });
    });
});

