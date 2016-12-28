'use strict';

const { getProcesses, PROCESS_KEYS } = require('./getProcesses.js');
const ProcessData = require('./process-data/ProcessData.js');
const ProcessHeader = require('./process-header/ProcessHeader.js');
const Dropdown = require('../dropdown/Dropdown.js');

const React = require('react');
const R = require('ramda');

class Processes extends React.Component
{
    constructor(props)
    {
        super(props);

        const initialProcesses = getProcesses();
        const memoryUsage = PROCESS_KEYS[4];
        const processesSortedByMemoryUsage = this.sortProcesses(initialProcesses, memoryUsage, true);

        this.state = {
            processes: processesSortedByMemoryUsage
        };
    }

    /**
     * sortProcesses and update <processes> sorted by a key, <keyToSortBy>.
     * @param {Array} processes - Current processes running on this machine.
     * @param {String} keyToSortBy - Key of a <process> object to sortProcesses by.
     * @param {Boolean} doReverseOrder - If true, then sortProcesses descending (z-a9-0).
     * @returns sortedProcesses - The given <processes> sorted by <keyToSortBy>.
     */
    sortProcesses(processes, keyToSortBy, doReverseOrder)
    {
        const sortValue = processes[0][keyToSortBy];
        const ifSortValueIsString = R.partial(R.is(String), [sortValue]);
        const reverseOrNot = doReverseOrder ? R.reverse : R.identity;

        const getProcessesSortedByKey = R.pipe(
            R.sortBy(
                R.ifElse(
                    ifSortValueIsString,
                    R.pipe(R.prop(keyToSortBy), R.toLower),
                    R.prop(keyToSortBy)
                )
            ),
            reverseOrNot
        );

        return getProcessesSortedByKey(processes);
    }

    /**
     * Given the <PROCESS_KEYS>, return the <ProcessHeader> components.
     * @param {Array[String]} PROCESS_KEYS - Array of keys of a <process> object.
     * @returns {Array[<ProcessHeader>]} - The <ProcessHeader> UI components.
     */
    renderProcessHeaders(PROCESS_KEYS)
    {
        const self = this;

        return PROCESS_KEYS.map((procKey, index, array) =>
            <ProcessHeader
                key={index}
                procKey={procKey}
                sortProcesses={self.sortProcesses.bind(self)}
                processes={self.state.processes}
            />
        );
    }

    /**
     * Accesses <self.state.processes> to return an array of <ProcessData> UI components.
     * @returns {Array[<ProcessData>]} - The <ProcessData> UI components.
     */
    renderProcessData()
    {
        return this.state.processes.map((proc, index, array) =>
            <ProcessData key={index} processData={proc} />
        );
    }

    render()
    {
        const self = this;

        return (
            <div className='css-container'>
                <table className='css-process-wrap'>

                    <thead className='css-process-header-wrap'>
                        <tr>
                            {self.renderProcessHeaders(PROCESS_KEYS)}
                        </tr>
                    </thead>

                    <tbody>
                        {self.renderProcessData()}
                    </tbody>

                </table>
            </div>
        );
    }
}

Processes.propTypes = {};
Processes.defaultProps = {};

module.exports = Processes;

// We'll use these methods (below) once the dropdown is working.

// getSummarizedProcess(processName)
// {
//     const processesOfThisName = R.filter(R.propEq('name', processName))(this.state.processes);

//     if (processesOfThisName.length === 1) return processesOfThisName[0];

//     const summarizedProcess = {
//         name: processName,
//         pids: R.map(procOfThisName => procOfThisName.pid)(processesOfThisName),
//         sessionName: processesOfThisName[0].sessionName,
//         sessionNumber: processesOfThisName[0].sessionNumber,
//         memoryUsage: R.reduce((totalMemUse, proc) => totalMemUse + proc.memoryUsage, 0)(processesOfThisName),
//         numberOfOccurrences: R.length(processesOfThisName)
//     };

//     return summarizedProcess;
// }

// getTotalMemoryUsage(processName)
// {
//     return R.pipe(
//         R.filter(proc => R.propEq('name', processName)(proc)),
//         R.map(proc => proc.memoryUsage),
//         R.reduce((totalMemUse, memUse) => total + memUse, 0)
//     )(this.state.processes);
// }
