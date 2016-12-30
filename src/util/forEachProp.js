'use strict';

const mapProp = require('./mapProp.js');

/**
 * Passes each key, value, index, and obj to the given function.
 * @param {Object} obj - An object.
 * @param {Function} func - A function to call on each prop of <obj>.
 */
module.exports = function forEachProp(obj, func)
{
    mapProp(obj, func);
}

