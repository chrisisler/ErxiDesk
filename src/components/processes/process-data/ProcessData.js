'use strict';

const {
    PROCESS_KEYS,
    makeProcessObj,
    convertMemoryUsageToNumber
} = require('../getProcesses.js');
const killProcess = require('../killProcesses.js');
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
     * User clicks a process -> open dropdown.
     * @param {Object} event - A (synthetic) "onContextMenu" event from React.
     */
    onRightClick(event)
    {
        // Build a process, <proc>, from <event>.
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
        // Add a dropdown action to kill the given process by PID and initialize actions array.
        const removeProcFromProcesses = R.partial(this.props.removeProcesses, [ [ proc ] ]);
        let dropdownActions = Dropdown.addAction([], `Kill "${proc.name}" (PID: ${proc.pid})`, [
            R.partial(killProcess, [ proc.pid ]),
            removeProcFromProcesses
        ]);

        // If there is more than one process with this name...
        const procsOfThisName = this.props.getProcessesOfThisName(proc.name);
        const procNameNum = procsOfThisName.length;
        if (procNameNum > 1)
        {
            const bothOrAllN = (procNameNum === 2) ? 'both' : `all ${procNameNum}`;

            const killAllProcsOfThisName = R.partial(
                R.forEach(pid => { killProcess(pid) }),
                [ procsOfThisName.map(p => p.pid) ]
            );
            dropdownActions = Dropdown.addAction(dropdownActions,
                `Kill ${bothOrAllN} "${proc.name}" processes`,
                [
                    killAllProcsOfThisName,
                    R.partial(this.props.removeProcesses, [ procsOfThisName ])
                ]
            );

            const summedProc = this.props.getSummarizedProcess(proc.name);
            dropdownActions = Dropdown.addAction(dropdownActions,
                `Summate ${bothOrAllN} "${proc.name}" processes`,
                [
                    () => { console.log('TODO: Make "Summate" triggers.'); },
                    () => { console.log('summedProc is:', summedProc); }
                ]
            );
        }

        dropdownActions = Dropdown.addAction(dropdownActions, 'Say Hello', () => { console.log('Hello!'); });

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
                {this.renderProcessData.call(this, this.props.processData)}
            </tr>
        );
    }
}

ProcessData.propTypes = {
    processData: React.PropTypes.object,
    getProcessesOfThisName: React.PropTypes.func,
    removeProcesses: React.PropTypes.func,
    getSummarizedProcess: React.PropTypes.func
};

ProcessData.defaultProps = {
    processData: {},
    getProcessesOfThisName: function() {},
    removeProcesses: function() {},
    getSummarizedProcess:function() {}
};

module.exports = ProcessData;

