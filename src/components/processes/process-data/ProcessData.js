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

        const dropdownActions = this.getDropdownActionsForThisProcess(proc);

        const dropdownComponent = <Dropdown actions={dropdownActions}
            x={event.pageX}
            y={event.pageY}
        />;

        ReactDOM.render(dropdownComponent, document.getElementById('dropdown'));
    }

    getDropdownActionsForThisProcess(proc)
    {
        // Dropdown.makeActionObj takes an array of functions to invoke as second argument.
        // The functions I pass to it are curried, then partially applied. so we trigger() them
        // Then they're invoked in Dropdown.js without Dropdown.js having to know what
        // args the functions/triggers took/needed.

        // Note: R.partial takes a func and its an array of its args.

        // Below are curried functions which when called with an array of args,
        // returns a partially applied function.
        const killGivenProcesses = R.partial(killProcesses);
        const removeGivenProcesses = R.partial(this.props.removeProcesses)

        // Add a dropdown action to kill the given process by PID and initialize actions array.
        let dropdownActions = Dropdown.makeActions([],
            `Kill "${proc.name}" (PID: ${proc.pid})`,
            [
                killGivenProcesses([[proc.pid]]),
                removeGivenProcesses([[proc]])
            ]
        );

        // If there is more than one process with this name...
        const procsOfThisName = this.props.getProcessesOfThisName(proc.name);
        const procNameNum = procsOfThisName.length;
        if (procNameNum > 1)
        {
            const bothOrAllN = (procNameNum === 2) ? 'both' : `all ${procNameNum}`;

            // Add a dropdown action to kill all procs with this name.
            dropdownActions = Dropdown.makeActions(dropdownActions,
                `Kill ${bothOrAllN} "${proc.name}" processes`,
                [
                    killGivenProcesses([ procsOfThisName.map(p => p.pid) ]),
                    removeGivenProcesses([ procsOfThisName ])
                ]
            );

            const summedProc = this.props.getSummarizedProcess(proc.name);

            // Add a dropdown action to summarized this proc.
            dropdownActions = Dropdown.makeActions(dropdownActions,
                `Summate ${bothOrAllN} "${proc.name}" processes`,
                [
                    removeGivenProcesses([ procsOfThisName ]),
                    R.partial(this.props.insertProcesses, [ [summedProc] ]) // NOT WORKING!!!!
                    // () => { console.log('summedProc is:', summedProc); }
                ]
            );
        }

        return dropdownActions;
    }

    /**
     * Given this.props.processData as an argument, return an array of HTML elements.
     * @param {Object} processData - A process object.
     * @returns {Array[<td/>]} - An array of <td> elements containing the values of
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
                onContextMenu={this.onRightClick.bind(this)}>
                {this.renderProcessData(this.props.processData)}
            </tr>
        );
    }
}

ProcessData.propTypes = {
    processData: React.PropTypes.object,
    getProcessesOfThisName: React.PropTypes.func,
    removeProcesses: React.PropTypes.func,
    getSummarizedProcess: React.PropTypes.func,
    insertProcesses: React.PropTypes.func
};

ProcessData.defaultProps = {
    processData: {},
    getProcessesOfThisName: function() {},
    removeProcesses: function() {},
    getSummarizedProcess: function() {},
    insertProcesses: function() {}
};

module.exports = ProcessData;

