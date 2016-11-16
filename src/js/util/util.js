/**
 * This file contains vague utility functions that don't
 * belong anywhere else.
 */

/**
 * Given a specified <object>, call the specified <func> on
 * each valid property in <object>. This function is map(),
 * but for objects.
 *
 * I wrote this function to reduce the headache of doing
 * something over each object key/val.
 *
 * @param {Object} object - Object to iterate.
 * @param {Function} func - Function to call with each pass.
 */
function objectMap(object, func)
{
    if (!object || !func) return;

    let index = 0;
    for (let key in object)
    {
        if (object.hasOwnProperty(key))
        {
            const value = object[key];
            func(key, value, index, object);
            index++;
        }
    }
}

module.exports =
{
    objectMap
};
