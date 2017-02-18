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
        // These functions are partially applied to prepare them for usage as
        // onclick event listeners. Each possible action available in the
        // dropdown context menu will trigger and invoke each function given
        // in the second argument of Dropdown.makeActionObj. This allows the
        // code in Dropdown.js to be unaware of the arguments needed per function.
        const _killProcs   = R.partial(killProcesses);
        const _hideProcs   = R.partial(this.props.hideProcesses);
        const _unhideProcs = R.partial(this.props.unhideProcesses);
        const _removeProcs = R.partial(this.props.removeProcesses);
        const _insertProcs = R.partial(this.props.insertProcesses);

        const singleActionText = `"${proc.name}" (PID: ${proc.pid})`;

        // The order the actions are pushed determines the order they are seen in.
        let dropdownActions = [];

        dropdownActions.push(Dropdown.makeActionObj(`Kill ${singleActionText}`, [
            _killProcs([[proc]]),
            _removeProcs([[proc]])
        ]));

        dropdownActions.push(Dropdown.makeActionObj(`Remove ${singleActionText}`, [
            _removeProcs([[proc]])
        ]));

        const procIsNotHidden = !this.props.processIsHidden(proc);
        const hideOrUnhideText = procIsNotHidden ? 'Hide' : 'Unhide';

        // Add an action to hide or unhide the process based on if it is hidden or not.
        dropdownActions.push(Dropdown.makeActionObj(
            `${hideOrUnhideText} ${singleActionText}`, [
            procIsNotHidden ? _hideProcs([[proc]]) : _unhideProcs([[proc]])
        ]));

        // If there are multiple processes with this name (e.g., Chrome has multiple instances).
        const sameNameProcs = this.props.getSameNameProcesses(proc);
        const numSameNameProcs = sameNameProcs.length;
        if (numSameNameProcs > 1)
        {
            const bothOrAllN = (numSameNameProcs === 2) ? 'both' : `all ${numSameNameProcs}`;
            const multiActionText = `${bothOrAllN} "${proc.name}" processes`;
            const divider = Dropdown.makeDivider();

            dropdownActions.push(
                divider,

                // Add a dropdown action to kill all procs with this name.
                Dropdown.makeActionObj(`Kill ${multiActionText}`, [
                    _killProcs([ sameNameProcs ]),
                    _removeProcs([ sameNameProcs ])
                ]),

                // Add an action to not show all procs with this name.
                Dropdown.makeActionObj(`Remove ${multiActionText}`, [
                    _removeProcs([sameNameProcs])
                ]),

                // Add an action to hide or unhide procs of this name if they're hidden or not.
                Dropdown.makeActionObj(
                    `${hideOrUnhideText} ${multiActionText}`, [
                    procIsNotHidden ? _hideProcs([sameNameProcs]) : _unhideProcs([sameNameProcs])
                ]),

                divider,

                // Add a dropdown action to summarize this process.
                Dropdown.makeActionObj(`Summate ${multiActionText}`, [
                    _insertProcs([[this.props.getSummatedProcess(proc)]])
                ])
            );
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
    getSameNameProcesses: React.PropTypes.func.isRequired,
    getSummatedProcess:   React.PropTypes.func.isRequired,
    removeProcesses:        React.PropTypes.func.isRequired,
    insertProcesses:        React.PropTypes.func.isRequired,
    hideProcesses:          React.PropTypes.func.isRequired,
    unhideProcesses:        React.PropTypes.func.isRequired,
    processIsHidden:        React.PropTypes.func.isRequired
};

ProcessData.defaultProps = {
    processData:            {},
    getSameNameProcesses: function() {},
    getSummatedProcess:   function() {},
    removeProcesses:        function() {},
    insertProcesses:        function() {},
    hideProcesses:          function() {},
    unhideProcesses:        function() {},
    processIsHidden:        function() {}
};

module.exports = ProcessData;

