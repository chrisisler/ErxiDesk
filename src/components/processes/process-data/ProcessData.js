'use strict';

const {
    PROCESS_KEYS,
    makeProcessObj,
    convertMemoryUsageToNumber
} = require('../getProcesses.js');
const killProcesses = require('../killProcesses.js');
const Dropdown = require('../../dropdown/Dropdown.js');
const Processes = require('../Processes.js');
const Util = require('../../../util/util.js');

const R = require('ramda');
const React = require('react'),
      ReactDOM = require('react-dom');

class ProcessData extends React.Component
{
    constructor(props)
    {
        super(props);
    }

    /**
     * Input: 87108
     * Output: '87,108 K'
     * @param {Number} memUse - The memoryUsage property of a processData object.
     * @returns {String} - That given memoryUsage as a string.
     * @private
     */
    _convertMemUseToString(memUse)
    {
        return memUse.toLocaleString() + ' K';
    }

    /**
     * User right clicks a process -> open dropdown.
     * @param {Object} event - A (synthetic) "onContextMenu" event from React.
     */
    onRightClick(event)
    {
        // Build a <process> object from the given event.
        const procRowNodeList = event.target.parentNode.childNodes;
        let proc = makeProcessObj(procRowNodeList, PROCESS_KEYS, node => node.textContent);
        proc = convertMemoryUsageToNumber(proc);

        const dropdownActions = this.getDropdownActions(proc);

        const dropdownComponent = <Dropdown actions={dropdownActions}
            x={event.pageX}
            y={event.pageY}
        />;

        ReactDOM.render(dropdownComponent, document.getElementById('dropdown'));
    }

    getDropdownActions(proc)
    {
        // Dropdown.makeActionObj takes an array of functions to invoke as second argument.
        // The functions passed to it are curried, then partially applied, then finally invoked.
        // They're invoked in Dropdown.js without having to know what args were needed.

        // Note: R.partial takes a func and its an array of its args.
        const killGivenProcesses = R.partial(killProcesses);
        const hideGivenProcesses = R.partial(this.props.hideProcesses);
        const removeGivenProcesses = R.partial(this.props.removeProcesses);
        const insertGivenProcesses = R.partial(this.props.insertProcesses);

        const killThisProcAction = Dropdown.makeActionObj(
            `Kill "${proc.name}" (PID: ${proc.pid})`, [
            killGivenProcesses([[proc.pid]]),
            removeGivenProcesses([[proc]])
        ]);

        const hideThisProcAction = Dropdown.makeActionObj(
            `Hide "${proc.name}" (PID: ${proc.pid})`, [
            hideGivenProcesses([[proc]]),
            removeGivenProcesses([[proc]])
        ]);

        // The order the actions are inserted here determines what the order the user sees them in.
        let dropdownActions = [
            killThisProcAction,
            hideThisProcAction
        ];

        // If there is more than one process with this name...
        const procsOfThisName = this.props.getProcessesOfThisName(proc.name);
        const procNameNum = procsOfThisName.length;
        if (procNameNum > 1)
        {
            const divider = Dropdown.makeActionObj('divider');

            const bothOrAllN = (procNameNum === 2) ? 'both' : `all ${procNameNum}`;
            const actionText = `${bothOrAllN} "${proc.name}" processes`;

            // Add a dropdown action to kill all procs with this name.
            const killAllProcsOfThisNameAction = Dropdown.makeActionObj(`Kill ${actionText}`, [
                killGivenProcesses([ procsOfThisName.map(p => p.pid) ]),
                removeGivenProcesses([ procsOfThisName ])
            ]);

            // Add a dropdown action to hide all procs with this name.
            const hideAllProcsOfThisNameAction = Dropdown.makeActionObj(`Hide ${actionText}`, [
                hideGivenProcesses([ procsOfThisName ])
            ]);

            // Add a dropdown action to summarized this proc.
            const summarizeThisProcAction = Dropdown.makeActionObj(`Summate ${actionText}`, [
                insertGivenProcesses([ [this.props.getSummarizedProcess(proc.name)] ])
            ]);

            dropdownActions.push(
                divider,
                killAllProcsOfThisNameAction,
                hideAllProcsOfThisNameAction,
                divider,
                summarizeThisProcAction
            );
        }

        return dropdownActions;
    }

    /**
     * Given this.props.processData as an argument, return an array of HTML elements.
     * @param {Object} processData - A process object.
     * @returns {Array[<td>]} - An array of <td> elements containing the values of
     *     the given processData object.
     */
    renderProcessData(processData)
    {
        // mapProp is Array.prototype.map but for each hasOwnProperty of the given object.
        return Util.mapProp(processData, (key, value, index, object) =>
            key === 'memoryUsage'
                ? <td key={index}>{this._convertMemUseToString(value)}</td>
                : <td key={index}>{value}</td>
        );
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
    hideProcesses:          React.PropTypes.func.isRequired
};

ProcessData.defaultProps = {
    processData:            {},
    getProcessesOfThisName: function() {},
    getSummarizedProcess:   function() {},
    removeProcesses:        function() {},
    insertProcesses:        function() {},
    hideProcesses:          function() {}
};

module.exports = ProcessData;

