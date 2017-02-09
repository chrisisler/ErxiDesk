'use strict';

/**
 * Returns the result of passes each key, value, index, and obj to the given function.
 * Like Array.prototype.map, but for the properties of an object.
 * @param {Object} obj - An object.
 * @param {Function} func - A function to call on each prop of <obj>.
 * @returns {Array} - Results of calling the provided function on every prop of given obj.
 */
module.exports = function mapProp(obj, func)
{
    const objCopy = Object.assign({}, obj);

    let index = 0,
        results = [];

    for (let key in obj)
    {
        if (obj.hasOwnProperty(key))
        {
            const value = obj[key];
            const result = func(key, value, index++, objCopy);

            results.push(result);
        }
    }
    return results;
}

