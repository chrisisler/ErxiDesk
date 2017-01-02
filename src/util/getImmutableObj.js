'use strict';

/**
 * Returns an immutable non-inheriting (?) clone of the given object.
 * @param {Object} obj - Object to return an immutable clone of.
 * @returns {Object}
 */
module.exports = function getImmutableObj(obj)
{
    const nullObj      = Object.create(null);
    const objClone     = Object.assign(nullObj, obj);
    const immutableObj = Object.freeze(objClone);

    return immutableObj;
}

