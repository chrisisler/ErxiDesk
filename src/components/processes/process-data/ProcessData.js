'use strict';

const {
    PROCESS_KEYS,
    mapProp,
    memoryUsageToNumber
} = require('../getProcesses.js');

const killProcesses = require('../killProcesses.js');
const Dropdown = require('../../dropdown/Dropdown.js');
const Processes = require('../Processes.js');

const R = require('ramda');
const React = require('react'),
      ReactDOM = require('react-dom');

/**
 * @private
 * @example 87108 -> '87,108 K'
 * @param {Number} memUse - The memoryUsage property of a processData object.
 * @returns {String} - That given memoryUsage as a string.
 */
const _convertMemoryUsageToString = mapProp('memoryUsage', R.pipe(
    R.unless(R.is(String), R.toString),
    R.reverse,
    R.splitEvery(3), R.flatten,
    R.join(','),
    R.reverse,
    R.concat(R.__, ' K')
));

class ProcessData extends React.Component
{
    constructor(props)
    {
        super(props);
    }

    /**
     * User right clicks a process -> open dropdown.
     * @param {Object} event - A (synthetic) "onContextMenu" event from React.
     */
    onRightClick(event)
    {
        // [...<iterable>] converts <iterable> to a mappable.
        const procValues = [...event.target.parentNode.childNodes].map(R.prop('textContent'));

        // Rebuild a process object by zipping obj keys with values taken from the event.
        const proc = R.zipObj(PROCESS_KEYS, procValues);

        const newDropdownComponent = <Dropdown actions={this.getDropdownActions(proc)}
            x={event.pageX}
            y={event.pageY}
        />;

        ReactDOM.render(newDropdownComponent, document.getElementById('dropdown'));
    }

    /**
     * Given a process, generate and return an array of `actions` (see Dropdown.js).
     * @see Dropdown.makeActionObj
     * @param {Object} proc - A `process` object.
     * @returns {Array[Object]} - Dropdown actions which populate the dropdown menu.
     */
    getDropdownActions(proc)
    {
        /**
         * These functions are partially applied to prepare them for usage as
         * onclick event listeners. Each possible action available in the
         * dropdown context menu will trigger and invoke each function given
         * in the second argument of Dropdown.makeActionObj. This allows the
         * code in Dropdown.js to be unaware of the arguments needed per function.
         */
        const killGivenProcesses   = R.partial(killProcesses);
        const hideGivenProcesses   = R.partial(this.props.hideProcesses);
        const unhideGivenProcesses = R.partial(this.props.unhideProcesses);
        const removeGivenProcesses = R.partial(this.props.removeProcesses);
        const insertGivenProcesses = R.partial(this.props.insertProcesses);

        const singleActionText = `"${proc.name}" (PID: ${proc.pid})`;

        // The order the actions are pushed determines the order they are seen in.
        let dropdownActions = [];

        // Add an action to kill the process the user just right-clicked.
        dropdownActions.push(Dropdown.makeActionObj(`Kill ${singleActionText}`, [
            killGivenProcesses([[proc.pid]]),
            removeGivenProcesses([[proc]])
        ]));

        // This if statement is written this way to preserve the order of elems pushed.
        const _procIsHidden = this.props.processIsHidden(proc);

        if (!_procIsHidden)
        {
            // Add an action to hide the process the user just right-clicked.
            dropdownActions.push(Dropdown.makeActionObj(`Hide ${singleActionText}`, [
                hideGivenProcesses([[proc]])
            ]));
        }
        else
        {
            // Add an action to unhide the process the user just right-clicked.
            dropdownActions.push(Dropdown.makeActionObj(`Unhide ${singleActionText}`, [
                unhideGivenProcesses([[proc]])
            ]));
        }

        // If there are multiple processes with this name (e.g., Chrome usually has multiple instances).
        const procsOfThisName = this.props.getProcessesOfThisName(proc.name);
        const numberOfProcsWithName = procsOfThisName.length;
        if (numberOfProcsWithName > 1)
        {
            const bothOrAllN = (numberOfProcsWithName === 2) ? 'both' : `all ${numberOfProcsWithName}`;
            const multiActionText = `${bothOrAllN} "${proc.name}" processes`;

            const divider = Dropdown.makeDivider();
            dropdownActions.push(divider);

            // Add a dropdown action to kill all procs with this name.
            dropdownActions.push(Dropdown.makeActionObj(`Kill ${multiActionText}`, [
                killGivenProcesses([ procsOfThisName.map(p => p.pid) ]),
                removeGivenProcesses([ procsOfThisName ])
            ]));

            if (!_procIsHidden)
            {
                // Add a dropdown action to hide all procs with this name.
                dropdownActions.push(Dropdown.makeActionObj(`Hide ${multiActionText}`, [
                    hideGivenProcesses([ procsOfThisName ])
                ]));
            }
            else
            {
                // Add a dropdown action to unhide all procs with this name.
                dropdownActions.push(Dropdown.makeActionObj(`Unhide ${multiActionText}`, [
                    unhideGivenProcesses([ procsOfThisName ])
                ]));
            }

            dropdownActions.push(divider);

            // Add a dropdown action to summarized this proc.
            dropdownActions.push(Dropdown.makeActionObj(`Summate ${multiActionText}`, [
                insertGivenProcesses([ [this.props.getSummarizedProcess(proc.name)] ])
            ]));
        }

        return dropdownActions;
    }

    /**
     * Return a list of <td> elements from each value of this.props.processData
     * @param {Object} processData - A process object.
     * @returns {Array[<td>]} - The values of the given obj.
     */
    renderProcessData(processData)
    {
        const getProcessAsTableDataElement = R.pipe(
            _convertMemoryUsageToString,
            R.values,
            R.map(value => <td key={value}>{value}</td>)
        );
        return getProcessAsTableDataElement(processData);
    }

    render()
    {
        return (
            <tr className='css-process-data'
                onContextMenu={this.onRightClick.bind(this)}
            >
                {this.renderProcessData(this.props.processData)}
            </tr>
        );
    }
}

ProcessData.propTypes = {
    processData:            React.PropTypes.object.isRequired,
    getProcessesOfThisName: React.PropTypes.func.isRequired,
    getSummarizedProcess:   React.PropTypes.func.isRequired,
    removeProcesses:        React.PropTypes.func.isRequired,
    insertProcesses:        React.PropTypes.func.isRequired,
    hideProcesses:          React.PropTypes.func.isRequired,
    unhideProcesses:        React.PropTypes.func.isRequired,
    processIsHidden:        React.PropTypes.func.isRequired
};

ProcessData.defaultProps = {
    processData:            {},
    getProcessesOfThisName: function() {},
    getSummarizedProcess:   function() {},
    removeProcesses:        function() {},
    insertProcesses:        function() {},
    hideProcesses:          function() {},
    unhideProcesses:        function() {},
    processIsHidden:        function() {}
};

module.exports = ProcessData;

