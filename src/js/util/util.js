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
function objectForEach(object, func)
{
    if (!object || !func)
    {
        console.error('Error: objectForEach() -> Insufficient params.');
    }

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

/**
 * Given a specified <jQueryElement>, call the specified <func>
 * on the element, after verifying that that element was
 * actually clicked.
 *
 * @param {Object} jQueryElement - Something like `$('div.input-wrap')`
 * @param {Function} func - Function to call on clicked DOM object.
 */
function whenClicked(jQueryElement, func)
{
    if (!jQueryElement || !func)
    {
        console.error('Error: whenClicked() -> Insufficient params.');
    }

    jQueryElement.on('click', () =>
    {
        if ($(this).data('clicked', true))
        {
            const clickedObject = event.target;
            func(clickedObject);
        }
    });
}

module.exports =
{
    objectForEach,
    whenClicked
};
