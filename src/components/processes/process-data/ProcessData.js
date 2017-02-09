'use strict';

const { PROCESS_KEYS, zipObjBy, memoryUsageToNumber } = require('../getProcesses.js');

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
        // [...<iterable>] converts <iterable> to a mappable.
        const procValues = [...event.target.parentNode.childNodes].map(R.prop('textContent'));
        const proc = memoryUsageToNumber(R.zipObj(PROCESS_KEYS, procValues));

        const dropdownActions = this.getDropdownActions(proc);

        const dropdownComponent = <Dropdown actions={dropdownActions}
            x={event.pageX}
            y={event.pageY}
        />;

        ReactDOM.render(dropdownComponent, document.getElementById('dropdown'));
    }

    /**
     * Given a process, generate and return an array of `actions` (see Dropdown.js).
     * @param {Object} proc - A `process` object.
     * @returns {Array[Object]} - Dropdown actions.
     */
    getDropdownActions(proc)
    {
        // Dropdown.makeActionObj takes an array of functions to invoke as second argument.
        // The functions passed to it are curried, then partially applied, then finally invoked.
        // They're invoked in Dropdown.js without having to know what args were needed.

        // Note: R.partial takes a func and its an array of its args.
        const killGivenProcesses   = R.partial(killProcesses);
        const hideGivenProcesses   = R.partial(this.props.hideProcesses);
        const unhideGivenProcesses = R.partial(this.props.unhideProcesses);
        const removeGivenProcesses = R.partial(this.props.removeProcesses);
        const insertGivenProcesses = R.partial(this.props.insertProcesses);

        const singleActionText = `"${proc.name}" (PID: ${proc.pid})`;

        // The order the actions are inserted here determines what the order the user sees them in.
        let dropdownActions = [];

        const killThisProcAction = Dropdown.makeActionObj(`Kill ${singleActionText}`, [
            killGivenProcesses([[proc.pid]]),
            removeGivenProcesses([[proc]])
        ]);
        dropdownActions.push(killThisProcAction);

        // This if statement is written this way to preserve the order of elems pushed.
        const _procIsHidden = this.props.processIsHidden(proc);

        if (!_procIsHidden)
        {
            const hideThisProcAction = Dropdown.makeActionObj(`Hide ${singleActionText}`, [
                hideGivenProcesses([[proc]])
            ]);
            dropdownActions.push(hideThisProcAction);
        }
        else
        {
            const unhideThisProcAction = Dropdown.makeActionObj(`Unhide ${singleActionText}`, [
                unhideGivenProcesses([[proc]])
            ]);
            dropdownActions.push(unhideThisProcAction);
        }

        // If are multiple processes with this name (e.g., Chrome usually has multiple instances).
        const procsOfThisName = this.props.getProcessesOfThisName(proc.name);
        const procNameNum = procsOfThisName.length;
        if (procNameNum > 1)
        {
            const bothOrAllN = (procNameNum === 2) ? 'both' : `all ${procNameNum}`;
            const multiActionText = `${bothOrAllN} "${proc.name}" processes`;

            const divider = Dropdown.makeDivider();
            dropdownActions.push(divider);

            // Add a dropdown action to kill all procs with this name.
            const killAllProcsOfThisNameAction = Dropdown.makeActionObj(`Kill ${multiActionText}`, [
                killGivenProcesses([ procsOfThisName.map(p => p.pid) ]),
                removeGivenProcesses([ procsOfThisName ])
            ]);
            dropdownActions.push(killAllProcsOfThisNameAction);

            if (!_procIsHidden)
            {
                // Add a dropdown action to hide all procs with this name.
                const hideAllProcsOfThisNameAction = Dropdown.makeActionObj(`Hide ${multiActionText}`, [
                    hideGivenProcesses([ procsOfThisName ])
                ]);
                dropdownActions.push(hideAllProcsOfThisNameAction);
            }
            else
            {
                // Add a dropdown action to unhide all procs with this name.
                const unhideAllProcsOfThisNameAction = Dropdown.makeActionObj(`Unhide ${multiActionText}`, [
                    unhideGivenProcesses([ procsOfThisName ])
                ]);
                dropdownActions.push(unhideAllProcsOfThisNameAction);
            }

            dropdownActions.push(divider);

            // Add a dropdown action to summarized this proc.
            const summarizeThisProcAction = Dropdown.makeActionObj(`Summate ${multiActionText}`, [
                insertGivenProcesses([ [this.props.getSummarizedProcess(proc.name)] ])
            ]);
            dropdownActions.push(summarizeThisProcAction);
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
        return Util.mapProp(processData, (key, value, index, obj) =>
            <td key={value}>
                { key === 'memoryUsage' ? this._convertMemUseToString(value) : value }
            </td>
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

