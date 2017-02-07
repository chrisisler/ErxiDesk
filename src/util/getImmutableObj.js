'use strict';

/**
 * Returns an immutable non-inheriting (?) clone of the given object.
 * @param {Object} obj - Object to return an immutable clone of.
 * @returns {Object}
 */
function getImmutableObj(obj)
{
    const objClone     = Object.assign({}, obj);
    const immutableObj = Object.freeze(objClone);

    return immutableObj;
}

