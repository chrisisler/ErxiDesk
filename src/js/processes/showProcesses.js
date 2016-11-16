/**
 * This file pulls data from ./getProcesses.js to display in
 * index.html with jQuery.
 */

// The path used in require() is relative to main.js.

// Internal libraries.
const Util = require('./js/util/util.js')
const GetProcesses = require('./js/processes/getProcesses.js');
const PROCESS_PROPERTY_KEYS = GetProcesses.PROCESS_PROPERTY_KEYS;
let processes = GetProcesses.getProcesses();

// External libraries.
const R = require('ramda');
const $ = require('jquery');

/**
 * Given the names of keys in one <process> in <processes>,
 * set the titles of the <process> properties (in HTML).
 * @param {Array} processKeys - Array of keys of a <process>.
 */
function showProcessHeader(processKeys)
{
    // Name of class given to elements created by this function.
    const headerClass = 'js-process-header';

    // Create one table row (tr) to hold the headers (columns).
    $(`thead.${headerClass}-wrap`).append(`<tr class="${headerClass}"></tr>`);

    // Get reference to header element to append column titles to.
    const headerElem = $(`tr.${headerClass}`);

    // To give each process property a proper column title, write
    // nice-looking column titles based on the keys of one that object.
    processKeys.forEach((key, index, array) =>
    {
        /** @see ./getProcesses.js for how PROCESS_PROPERTY_KEYS is ordered. @private */
        function _getTitle(key)
        {
            if      (key === PROCESS_PROPERTY_KEYS[0]) return 'Name';
            else if (key === PROCESS_PROPERTY_KEYS[1]) return 'Process ID';
            else if (key === PROCESS_PROPERTY_KEYS[2]) return 'Session Name';
            else if (key === PROCESS_PROPERTY_KEYS[3]) return 'Session #';
            else if (key === PROCESS_PROPERTY_KEYS[4]) return 'Memory Usage';
        }

        // Set property title (in HTML).
        headerElem.append(`<th class="${headerClass}-title" id="${key}">${_getTitle(key)}</th>`);
    });

    // Add a non 'js-' prepended class (to the title made above) for CSS styling.
    $(`th.${headerClass}-title`).addClass('css-process-header-title');
}

/**
 * For each <process> in <processes> (retrieved from ./getProcesses.js),
 * display that processes properties to the user.
 * @param {Array} processes - Array of objects representing user's processes.
 */
function showProcessData(processes)
{
    // Name of class given to elements created by this function.
    const dataClass = 'js-process-data';
    const processDataWrapElem = $(`tbody.${dataClass}-wrap`);

    // User can click a process property title in the header to sort each process
    // in the table by that property (ascending). When this is done, this
    // function is called with <processes> re-ordered based on what was clicked.
    // Empty the js-process-data-wrap container of processes and redraw.
    if (processDataWrapElem.length > 0) { processDataWrapElem.empty(); }

    // Each <process> (row) is given a class name with its index = numProcesses.
    let numProcesses = processDataWrapElem.length;

    // processes = processes.slice(0, 5); // TESTING

    processes.forEach((proc) =>
    {
        // Name of class given to rows created by this for-loop.
        const newProcessClass = `${dataClass}-${numProcesses++}`;

        // Create table row to represent a <process> object and contain,
        // per column, that processes properties.
        const newProcess = `<tr class="${newProcessClass}"></tr>`;
        processDataWrapElem.append(newProcess);

        // For each property, add that data value into the row.
        const newProcessElem = $(`tr.${newProcessClass}`);
        Util.objectForEach(proc, (key, value, index, object) =>
        {
            // Append ' K' to <memoryUsage> property.
            if (key === 'memoryUsage')
            {
                value = value.toLocaleString() + ' K';
            }

            newProcessElem.append(`<td class="${dataClass}-${key}">${value}</td>`);
        });
        newProcessElem.addClass('css-process-data');
    });
}

$(document).ready(() =>
{
    let processKeys = null;

    function init()
    {
        // Reliable only if each process has the same keys.
        processKeys = Object.keys(processes[0]);

        showProcessHeader(processKeys);
        showProcessData(processes);
    }
    init();

    // When user clicks a process header title (ex: 'Process ID'), sort
    // (and redraw) each <process> based on that property, in ascending order.
    Util.whenClicked($('.js-process-header-title'), (clickedProcessPropertyHeader) =>
    {
        const sortKey = clickedProcessPropertyHeader.id;
        const propertyToSortBy = processes[0][sortKey];
        const removeBrokenProcesses = R.filter(_ => !!_[sortKey]);

        let sortingPipeline;
        if (R.is(String, propertyToSortBy))
        {
            sortingPipeline = R.pipe(
                removeBrokenProcesses,
                R.sortBy(
                    R.compose(
                        R.toLower,
                        R.prop(sortKey)
                    )
                )
            );
        }
        else if (R.is(Number, propertyToSortBy))
        {
            sortingPipeline = R.pipe(
                removeBrokenProcesses,
                R.sortBy(
                    R.prop(sortKey)
                )
            );
        }
        else
        {
            console.error('Error: Util.whenClicked() -> <propertyToSortBy> invalid.');
            return;
        }

        processes = sortingPipeline(processes);

        showProcessData(processes);
    });
});

