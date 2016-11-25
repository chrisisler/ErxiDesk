/**
 * This file pulls data from ./getProcesses.js to display in index.html with jQuery.
 */

// Internal libraries.
const Util = require('./js/util/util.js');

const GetProcesses = require('./js/processes/getProcesses.js');
const PROCESS_KEY_NAMES = GetProcesses.PROCESS_KEY_NAMES;
let processes = GetProcesses.getProcesses();

// External libraries.
const R = require('ramda');
let $ = require('jquery'); // Warning: Redefinition of '$'.

const Header = (function()
{
    const baseClass = 'process-header';
    const cssClass = `css-${baseClass}`;
    const jsClass = `js-${baseClass}`;
    const jsTitleClass = `${jsClass}-title`;

    // Given a <key> of a <process>, return a title string for that property.
    function _getTitle(key)
    {
        if      (key === PROCESS_KEY_NAMES[0]) { return 'Name'; }
        else if (key === PROCESS_KEY_NAMES[1]) { return 'Process ID'; }
        else if (key === PROCESS_KEY_NAMES[2]) { return 'Session Name'; }
        else if (key === PROCESS_KEY_NAMES[3]) { return 'Session #'; }
        else if (key === PROCESS_KEY_NAMES[4]) { return 'Memory Usage'; }
    }

    const Header =
    {
        Elem:
        {
            wrap: `thead.${jsClass}-wrap`,
            header: `tr.${jsClass}`,
            title: `th.${jsTitleClass}`
        },

        init: function()
        {
            // MUST BE IN THIS ORDER.
            Header.show(PROCESS_KEY_NAMES);
            Header.bindUIActions();
        },

        bindUIActions: function()
        {
            // Click a process header title -> sort <processes> by that property.
            Util.whenClicked('left', $(Header.Elem.title), (clickedDomObject) =>
            {
                Header.sorting.handleSorting(clickedDomObject, processes);
            });
        },

        sorting:
        {
            key: null, // A key of a <process> object.
            doReverseSort: false,

            handleSorting: function(clickedHeaderHtml, processes)
            {
                const clickedHeader = clickedHeaderHtml.target;

                // If this is true, then this function has been called for a least
                // a second time. Allow user to click again to reverse sort order.
                if (Header.sorting.key === clickedHeader.id)
                {
                    Header.sorting.doReverseSort = !Header.sorting.doReverseSort;
                }
                else
                {
                    Header.sorting.key = clickedHeader.id;
                }

                const sortedProcesses = ProcData.sort(Header.sorting.key, processes, Header.sorting.doReverseSort);
                const doRedraw = true;
                ProcData.show(sortedProcesses, doRedraw);
            }
        },

        // Append titles to table head based on names of keys of a process object.
        show: function(processKeys)
        {
            $(Header.Elem.wrap).append(`<tr class="${jsClass}"></tr>`);

            processKeys.forEach((key) =>
            {
                const attributes = `class="${jsTitleClass} ${key}" id="${key}"`;
                const titleHtml = `<th ${attributes}>${_getTitle(key)}</th>`;
                $(Header.Elem.header).append(titleHtml);
            });

            $(Header.Elem.title).addClass(`${cssClass}-title`);
        }
    };

    return Header;

}());

// End `Header` namespace.

const ProcData = (function()
{
    const baseClass = 'process-data';
    const cssClass = `css-${baseClass}`;
    const jsClass = `js-${baseClass}`;
    const jsRowClass = `${jsClass}-row`;
    const memUse = 'memoryUsage';
    const dropdownClass = 'js-process-dropdown';

    // For ProcData.dropdown().
    const ProcData =
    {
        Elem:
        {
            row: `tr.${jsRowClass}`,
            wrap: `tbody.${jsClass}-wrap`,
            dropdownWrap: `ul#${jsRowClass}.dropdown-content`
        },

        init: function()
        {
            ProcData.show(processes, false);
            ProcData.bindUIActions();
        },

        bindUIActions: function()
        {
            Util.whenClicked('right', $(ProcData.Elem.row), (clickedDomObject) =>
            {
                ProcData.dropdown.show(clickedDomObject, processes);
            });
        },

        /**
         * For each <process> in <processes> (retrieved from ./getProcesses.js),
         * display that processes properties to the user.
         * @param {Array} processes - Array of objects representing user's processes.
         * @param {Boolean} doRedraw - Whether to clear previous process data or not.
         */
        show: function(processes, doRedraw=false)
        {
            let numProcesses = $(ProcData.Elem.wrap).length;

            if (doRedraw)
            {
                // Click a property title -> sort processes by that property.
                // When this occurs, this function is called with <processes> sorted.
                // All we have to do here is empty the table body wrapper and redraw.
                if (numProcesses > 0)
                {
                    // TODO: Redrawing removes the dropdown menu. Fix.
                    console.log('$(ProcData.Elem.wrap) is:', $(ProcData.Elem.wrap));
                    $(ProcData.Elem.wrap).empty();
                }
            }
            else
            {
                // Not redrawing, then this function is being called for the first time.
                // Default behavior is for <processes> to be sorted based on memory usage.
                processes = ProcData.sort(memUse, processes, true);
            }

            processes.forEach((proc) =>
            {
                const uniqueClass = `${jsRowClass}-${numProcesses++}`;
                const newProcessRowHtml = `<tr class="${uniqueClass} ${jsRowClass}"></tr>`;
                const newProcessRowElem = `${ProcData.Elem.row}.${uniqueClass}`;
                $(ProcData.Elem.wrap).append(newProcessRowHtml);
                $(newProcessRowElem).addClass(cssClass);

                // For each property, add that data value into the row.
                Util.objectForEach(proc, (key, value, index, object) =>
                {
                    // <memoryUsage> property is a Number representing kilobytes -> append ' K'.
                    if (key === memUse) { value = value.toLocaleString() + ' K'; }

                    const innerAttributes = `class="dropdown-button" data-activates="${jsRowClass}"`;
                    const innerData = `<a ${innerAttributes}>${value}</a>`;

                    const outerAttributes = `class="${jsClass}-${key} ${key} ${jsClass}-value"`;
                    const newProcess = `<td ${outerAttributes}>${innerData}</td>`;

                    $(newProcessRowElem).append(newProcess);
                });
            });
            // TODO: Make cool notifications? Its 2:26 AM, this may not be a good idea.
            // Materialize.toast(`${numProcesses} processes`, 1000);
        },

        /**
         * Sort and return <processes>, based on a property (key) of a <process> object.
         * @param {String} sortKey - Key of a <process> object to sort by (in String form).
         * @param {Array} processes - Current processes running on this machine.
         * @param {Boolean} doReverseSort - If true, then sort descending (z-a).
         * @returns sortedProcesses - <processes> sorted by a property, <sortKey>.
         */
        sort: function(sortKey, processes, doReverseSort)
        {
            const sortValue = processes[0][sortKey];
            const ifSortValueIsString = R.partial(R.is(String), [sortValue]);
            const reverseOrNot = doReverseSort ? R.reverse : R.identity;

            const sortingPipeline = R.pipe(
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
        },

        dropdown:
        {
            options:
            {
                inDuration: 250,
                outDuration: 250,
                constrain_width: false, // try both
                hover: false,
                gutter: 0, // spacing from edge
                belowOrigin: true, // dropdown shows below the button
                alignment: 'left' // dropdown shows with edge aligned to the left of button
            },

            // Append option/item <textContent> and <id> attribute to dropdown menu.
            _addOption: function(id, textContent)
            {
                const optionHtml = `<li id="${id}"><a>${textContent}</a></li>`;
                $(ProcData.Elem.dropdownWrap).append(optionHtml);
            },

            // Return the number of processes who share the same value for some <key>.
            _getNumProcessByKey: function(processes, process, key)
            {
                const pipeline = R.pipe(
                    R.filter(_ => _[key] === process[key]),
                    R.length
                );
                return pipeline(processes);
            },

            // TODO: When killing processes, if the process fails to be killed, try
            // - again with '.exe' appended to the end - since it was removed from some procs.
            // The order in which dropdown menu items are appended is important.
            show: function(clickedProcessRow, processes)
            {
                // Reconstruct a <process> object from the right-clicked element data.
                const processObjHtml = $(clickedProcessRow.currentTarget).children();
                const processObj = {};
                R.range(0, 5).forEach((index) =>
                {
                    processObj[PROCESS_KEY_NAMES[index]] = processObjHtml[index].textContent;
                });

                // The dropdown wrap element is first cleared of items from previous dropdowns.
                // Otherwise, every showing of the dropdown alsos display options from previous dropdown.
                $(ProcData.Elem.dropdownWrap).empty();

                // Add 'Cancel' option first.
                ProcData.dropdown._addOption(`${dropdownClass}-cancel`, 'Cancel');

                const killOneOption = `Kill process "${processObj.name}" (PID: ${processObj.pid})`;
                ProcData.dropdown._addOption(`${dropdownClass}-kill-one`, killOneOption);

                const numOfThisProcess = ProcData.dropdown._getNumProcessByKey(processes, processObj, 'name');
                if (numOfThisProcess > 1)
                {
                    const killAllOption = `Kill all ${numOfThisProcess} "${processObj.name}" processes`;
                    ProcData.dropdown._addOption(`${dropdownClass}-kill-all`, killAllOption);
                }

                // Let dropdown menu position be dependent on the currently hovered column.
                processObjHtml.each((index, element) =>
                {
                    if ($(element).is(':hover'))
                    {
                        const currentDropdownElem = element.firstChild;

                        $(currentDropdownElem).dropdown('close');

                        $(currentDropdownElem).dropdown(ProcData.dropdown.options);
                        $(currentDropdownElem).dropdown('open');

                        $(ProcData.Elem.dropdownWrap).on('mouseleave', () =>
                        {
                            $(currentDropdownElem).dropdown('close');
                            $(ProcData.Elem.dropdownWrap).empty();
                        });
                    }
                });
            }
        }
    };

    return ProcData;

}());

// End `ProcData` namespace.

$(document).ready(() =>
{
    function init()
    {
        Header.init();
        ProcData.init();
    }
    init();
});

