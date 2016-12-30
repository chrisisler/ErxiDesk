'use strict';

/**
 * Given an <array>, create and return a clone of the original array.
 * Note: If objects exist in this array, the references are kept; i.e. this
 *     does not do a "deep" clone of the array contents.
 * @param {Array} array - An array.
 * @returns {Array} - A clone of the original <array>.
 */
module.exports = function cloneArray(array)
{
    return array.slice(0);
};

