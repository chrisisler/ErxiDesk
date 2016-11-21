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
let $ = require('jquery');

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
        headerElem.append(`<th class="${headerClass}-title ${key}" id="${key}">${_getTitle(key)}</th>`);
    });

    // Add a non 'js-' prepended class (to the title made above) for CSS styling.
    $(`th.${headerClass}-title`).addClass('css-process-header-title');
}

/**
 * For each <process> in <processes> (retrieved from ./getProcesses.js),
 * display that processes properties to the user.
 * @param {Array} processes - Array of objects representing user's processes.
 * @param {Boolean} doRedraw - Whether to clear previous process data or not.
 */
function showProcessData(processes, doRedraw=false)
{
    // Name of class given to elements created by this function.
    const dataClass = 'js-process-data';
    const processDataWrapElem = $(`tbody.${dataClass}-wrap`);

    // User can click a process property title in the header to sort each process
    // in the table by that property (ascending). When this is done, this
    // function is called with <processes> sorted based on what was clicked.
    // Empty the js-process-data-wrap container of processes and redraw.
    if (doRedraw && processDataWrapElem.length > 0)
    {
        processDataWrapElem.empty();
    }

    // Not redrawing, then this function is being called for the first time.
    // Default behavior is for <processes> to be sorted based on memory usage.
    if (!doRedraw)
    {
        processes = sortProcessesBy('memoryUsage', processes, true);
    }

    // Each <process> (row) is given a class name with its index = numProcesses.
    let numProcesses = processDataWrapElem.length;

    processes.forEach((proc) =>
    {
        // Name of class given to rows created by this for-loop.
        const genericClass = `${dataClass}-row`;
        const uniqueClass = `${genericClass}-${numProcesses++}`;

        // Create table row to represent a <process> object.
        const newProcessRow = `<tr class="${uniqueClass} ${genericClass}"></tr>`;
        processDataWrapElem.append(newProcessRow);

        const newProcessRowElem = $(`tr.${uniqueClass}`);
        newProcessRowElem.addClass('css-process-data');

        // For each property, add that data value into the row.
        Util.objectForEach(proc, (key, value, index, object) =>
        {
            // Append ' K' to <memoryUsage> property.
            if (key === 'memoryUsage')
            {
                value = value.toLocaleString() + ' K';
            }

            // Append <newProcessData> inside `a` tags so we can add a dropdown menu later.
            const innerData = `<a class="dropdown-button" data-activates="${genericClass}">${value}</a>`;
            const newProcessData = `<td class="${dataClass}-${key} ${key} ${dataClass}-value">${innerData}</td>`;
            newProcessRowElem.append(newProcessData);
        });
    });
    // console.log('Number of processes:', processes.length);
}

/**
 * Sort and return <processes>, based on a property (key) of a <process> object.
 * @param {String} sortKey - Key of a <process> object to sort by (in String form).
 * @param {Array} processes - Current processes running on this machine.
 * @param {Boolean} doReverseSort - If true, then sort descending (z-a).
 * @returns sortedProcesses - <processes> sorted by a property, <sortKey>.
 */
function sortProcessesBy(sortKey, processes, doReverseSort)
{
    const sortValue = processes[0][sortKey];
    const ifSortValueIsString = R.partial(R.is(String), [sortValue]);
    const removeBrokenProcesses = R.filter(proc => !!proc[sortKey]);
    const reverseOrNot = doReverseSort ? R.reverse : R.identity;

    const sortingPipeline = R.pipe(
        removeBrokenProcesses,
        R.sortBy(
            R.ifElse(
                ifSortValueIsString,
                R.pipe(R.prop(sortKey), R.toLower),
                R.prop(sortKey)
            )
        ),
        reverseOrNot
    );

    return sortingPipeline(processes);
}

$(document).ready(() =>
{
    // <processKeys> is an array of the keys of a <process> object.
    let processKeys = null;

    // <sortKey> is a key of a <process> object - used for sorting <processes>.
    let sortKey = null;

    // <doReverseSort> specificies whether or not to sort <processes>
    // in reverse order or not. Default is non-reversed (which is ascending-order).
    let doReverseSort = false;

    function init()
    {
        // Reliable only if each process has the same keys.
        processKeys = Object.keys(processes[0]);

        showProcessHeader(processKeys);
        showProcessData(processes, false, false);
    }
    init();

    const processHeaderTitleClass = 'js-process-header-title';
    const processHeaderTitleElems = $(`.${processHeaderTitleClass}`);

    /**
     * When user clicks a process header title (ex: 'Process ID'), sort
     * (and redraw) each <process> based on that property.
     */
    Util.whenClicked('left', processHeaderTitleElems, (clickedDomObject) =>
    {
        // User clicks a process header title (ex: 'Memory Usage') for a
        // second time -> sort redraw <processes> but in reverse order.
        if (sortKey === clickedDomObject.target.id)
        {
            doReverseSort = !doReverseSort;
        }
        else
        {
            sortKey = clickedDomObject.target.id;
        }

        // Since user clicked on a header title, we will always do a redraw.
        const doRedraw = true;

        const sortedProcesses = sortProcessesBy(sortKey, processes, doReverseSort);
        showProcessData(sortedProcesses, doRedraw);
    });

    Util.whenClicked('right', $('.js-process-data-row'), (clickedDomObject) =>
    {
        /**
         * Add 'class="dropdown-button"'
         * Add 'data-activates="js-process-data-dropdown"'
         */
        console.log('right-clicked a process');
    });
});

