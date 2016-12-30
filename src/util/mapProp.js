'use strict';

/**
 * Returns the result of passes each key, value, index, and obj to the given function.
 * Like Array.prototype.map, but for the properties of an object.
 * @param {Object} obj - An object.
 * @param {Function} func - A function to call on each prop of <obj>.
 */
module.exports = function mapProp(obj, func)
{
    let index = 0,
        result = [];

    for (let key in obj)
    {
        if (obj.hasOwnProperty(key))
        {
            const val = obj[key];
            const objCopy = Object.assign({}, obj);

            result.push(func(key, val, index++, objCopy));
        }
    }
    return result;
}

