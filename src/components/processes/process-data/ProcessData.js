'use strict';

const { PROCESS_KEYS, memUseToNum, mapProp, pidToNum } = require('../getProcesses.js');

const Dropdown = require('../../dropdown/Dropdown.js');

const R = require('ramda');
const React = require('react');
const ReactDOM = require('react-dom');

/**
 * @example 87108 -> '87,108 K'
 * @param {Object} - A processData object.
 * @returns {Object} - Object with memoryUsage prop as a String.
 */
const memUseToStr = mapProp('memoryUsage', R.pipe(
    R.unless(R.is(String), R.toString),
    R.reverse,
    R.splitEvery(3), R.flatten, R.join(','),
    R.reverse,
    R.concat(R.__, ' K')
));

/**
 * Input: { pid: "7322", memoryUsage: "37111" }
 * Output: { pid: 7322, memoryUsage: 37111 }
 */
const pidAndMemUseToNum = R.pipe(memUseToNum, pidToNum);

class ProcessData extends React.Component
{
    constructor(props)
    {
        super(props);
        this.cssClass = 'css-process-data';
    }

    /**
     * Show a dropdown context menu when the user right-clicks a process row.
     * @param {Object} event - A (synthetic) "onContextMenu" event from React.
     */
    onRightClick(event)
    {
        // [...<iterable>] converts <iterable> to an array.
        const procValues = [...event.target.parentNode.childNodes].map(x => x.textContent);

        // Rebuild a process object by zipping obj keys with values taken from the event.
        const proc = pidAndMemUseToNum(R.zipObj(PROCESS_KEYS, procValues));

        const x = event.pageX;
        const y = event.pageY;
        const dropdown = <Dropdown actions={this.getDropdownActions(proc)} x={x} y={y} />;

        ReactDOM.render(dropdown, document.getElementById('dropdown'));
    }

    /**
     * Given a process, generate and return an array of `actions` (see Dropdown.js).
     * @see Dropdown.newAction
     * @param {Object} proc - A `process` object.
     * @returns {Array[Object]} - Dropdown actions which populate the dropdown menu.
     */
    getDropdownActions(proc)
    {
        const procIsNotHidden = !this.props.processIsHidden(proc);
        const hideOrUnhideText = procIsNotHidden ? 'Hide' : 'Unhide';

        // The below functions are partially applied to prepare them for usage as
        // onclick event listeners. Each possible action available in the
        // dropdown context menu will trigger and invoke each function given
        // in the second argument of Dropdown.newAction. This allows the
        // code in Dropdown.js to be unaware of the arguments needed per function.
        // R.partial requires args as a list. Calling a partial'ed func returns a func.
        const _kill   = R.partial(this.props.killProcesses);
        const _hide   = R.partial(this.props.hideProcesses);
        const _unhide = R.partial(this.props.unhideProcesses);
        const _remove = R.partial(this.props.removeProcesses);
        const _insert = R.partial(this.props.insertProcesses);

        const oneProcMsg = `${proc.name} (PID: ${proc.pid})`;

        // The order the actions are pushed determines the order they are seen in.
        let actions = [];

        actions.push(
            Dropdown.newAction(`Kill ${oneProcMsg}`, [ _kill([[proc]]), _remove([[proc]]) ]),
            Dropdown.newAction(`Remove ${oneProcMsg}`, _remove([[proc]])),

            // Add an action to hide or unhide the process based on if it is hidden or not.
            Dropdown.newAction(`${hideOrUnhideText} ${oneProcMsg}`,
                procIsNotHidden ? _hide([[proc]]) : _unhide([[proc]])
            )
        );
        const sameNameProcs = this.props.getSameNameProcesses(proc);
        const numberOfSameNameProcs = sameNameProcs.length;

        if (numberOfSameNameProcs > 1)
        {
            const bothOrAllN = numberOfSameNameProcs === 2 ? 'both' : `all ${numberOfSameNameProcs}`;
            const multiProcMsg = `${bothOrAllN} "${proc.name}" processes`;
            const divider = Dropdown.makeDivider();

            actions.push(
                divider,

                // Add a dropdown action to kill all procs with this name.
                Dropdown.newAction(`Kill ${multiProcMsg}`, [
                    _kill([sameNameProcs]),
                    _remove([sameNameProcs])
                ]),

                // Add an action to not show all procs with this name.
                Dropdown.newAction(`Remove ${multiProcMsg}`, _remove([sameNameProcs])),

                // Add an action to hide or unhide procs of this name if they're hidden or not.
                Dropdown.newAction(`${hideOrUnhideText} ${multiProcMsg}`,
                    procIsNotHidden ? _hide([sameNameProcs]) : _unhide([sameNameProcs])
                ),

                divider,

                // Add a dropdown action to summarize this process.
                Dropdown.newAction(`Summate ${multiProcMsg}`, [
                    _insert([[this.props.getSummatedProcess(proc)]]),
                    _remove([sameNameProcs])
                ])
            );
        }
        return actions;
    }

    /**
     * Return a list of <td> elements from each value of this.props.processData
     * @param {Object} processData - A process object.
     * @returns {Array[<td>]} - The values of the given obj.
     */
    renderProcessData(processData)
    {
        const getProcessAsTableDataElement = R.pipe(
            memUseToStr,
            R.values,
            R.map(value => <td key={value}>{value}</td>)
        );
        return getProcessAsTableDataElement(processData);
    }

    render()
    {
        return (
            <tr className={this.cssClass}
                onContextMenu={this.onRightClick.bind(this)}
            >
                {this.renderProcessData(this.props.processData)}
            </tr>
        );
    }
}

ProcessData.propTypes = {
    processData:            React.PropTypes.object.isRequired,
    getSameNameProcesses:   React.PropTypes.func.isRequired,
    getSummatedProcess:     React.PropTypes.func.isRequired,
    removeProcesses:        React.PropTypes.func.isRequired,
    insertProcesses:        React.PropTypes.func.isRequired,
    hideProcesses:          React.PropTypes.func.isRequired,
    unhideProcesses:        React.PropTypes.func.isRequired,
    processIsHidden:        React.PropTypes.func.isRequired,
    killProcesses:          React.PropTypes.func.isRequired
};

ProcessData.defaultProps = {
    processData:            {},
    getSameNameProcesses:   function() {},
    getSummatedProcess:     function() {},
    removeProcesses:        function() {},
    insertProcesses:        function() {},
    hideProcesses:          function() {},
    unhideProcesses:        function() {},
    processIsHidden:        function() {},
    killProcesses:          function() {}
};

module.exports = ProcessData;

