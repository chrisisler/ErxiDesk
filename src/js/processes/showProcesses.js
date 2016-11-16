/**
 * This file pulls data from ./getProcesses.js to display in
 * index.html with jQuery.
 */

// The path used in require() is relative to main.js.
const processes = require('./js/processes/getProcesses.js').getProcesses();
const Util = require('./js/util/util.js')
const R = require('ramda');
const $ = require('jquery');

/**
 * Given the names of keys in one <process> in <processes>,
 * set the titles of the <process> properties (in HTML).
 * @param {Array} processes - Output of `tasklist` from ./getProcesses.js
 */
function showProcessHeader(processes)
{
    // Name of class given to elements created by this function.
    const headerClass = 'js-process-header';

    // Create one table row (tr) to hold the headers (columns).
    $(`thead.${headerClass}-wrap`).append(`<tr class="${headerClass}"></tr>`);

    // Get reference to header element to append column titles to.
    const headerElem = $(`tr.${headerClass}`);

    // To give each process property a proper column title, write
    // nice-looking column titles based on the keys of one that object.
    const processKeys = Object.keys(processes[0]);
    processKeys.forEach((key, index, array) =>
    {
        /** Given a string, <key>, return a nicer version. @private */
        function _getTitle(key)
        {
            if (key === 'name')               return 'Name';
            else if (key === 'pid')           return 'Process ID';
            else if (key === 'sessionName')   return 'Session Name';
            else if (key === 'sessionNumber') return 'Session #';
            else if (key === 'memoryUsage')   return 'Memory Usage';
        }

        const propertyTitleHtml = `<th class="${headerClass}-title" id="${key}">${_getTitle(key)}</th>`;
        headerElem.append(propertyTitleHtml);
    });

    // Add a non 'js-' prepended class (to the title made above) for CSS styling.
    $(`th.${headerClass}-title`).addClass('process-header-title');
}

/**
 * For each <process> in <processes> (retrieved from ./getProcesses.js),
 * display that processes properties to the user.
 * @param {Array} processes - Array of objects representing user's processes.
 */
function showProcessData(processes)
{
    // Name of class given to elements created by this function.
    const dataClassCSS = 'process-data' // For CSS styling.
    const dataClass = 'js-process-data';
    const processDataWrapElem = $(`tbody.${dataClass}-wrap`);

    // Each <process> (row) is given a class name with its index = numProcesses.
    let numProcesses = processDataWrapElem.length;

    processes = processes.slice(0, 20); // TESTING

    processes.forEach((proc) =>
    {
        // Name of class given to rows created by this for-loop.
        const newProcessClass = `${dataClass}-${numProcesses++}`;

        // Create table row to represent a <process> object and contain,
        // per column, that processes properties.
        processDataWrapElem.append(`<tr class="${newProcessClass} ${dataClassCSS}"></tr>`);

        // For each property, add that data value into the row.
        Util.objectMap(proc, (key, value, index, object) =>
        {
            // Append ' K' to <memoryUsage> property.
            if (key === 'memoryUsage')
            {
                value = value.toLocaleString() + ' K';
            }

            $(`tr.${newProcessClass}`).append(
                `<td class="${dataClass}-${key}">${value}</td>`
            );
        });
    });
}

$(document).ready(() =>
{
    function init()
    {
        showProcessData(processes);
        showProcessHeader(processes);
    }

    init();
});
