'use strict';

/**
 * Passes each key, value, index, and obj to the given function.
 * @param {Object} obj - An object.
 * @param {Function} func - A function to call on each prop of <obj>.
 */
module.exports = function perProp(obj, func)
{
    let index = 0;

    for (let key in obj)
    {
        if (obj.hasOwnProperty(key))
        {
            const val = obj[key];
            const objCopy = Object.assign({}, obj);

            func(key, val, index++, objCopy);
        }
    }
}

