'use strict';

// Internal imports.
const { getProcesses, PROCESS_KEYS } = require('./getProcesses.js');
const ProcessData = require('./process-data/ProcessData.js');
const ProcessHeader = require('./process-header/ProcessHeader.js');

// External imports.
const React = require('react');
const R = require('ramda');

class Processes extends React.Component
{
    constructor(props)
    {
        super(props);

        // Note: If it is not used in render(), it should not be in the state.
        this.state = {
            processes: getProcesses()
        };
    }

    componentDidMount()
    {
        const memoryUsage = PROCESS_KEYS[4];
        this.sort(memoryUsage, this.state.processes, true);
    }

    /**
     * Sort and update <processes> sorted by a key, <keyToSortBy>.
     * @param {String} keyToSortBy - Key of a <process> object to sort by.
     * @param {Array} processes - Current processes running on this machine.
     * @param {Boolean} doReverseOrder - If true, then sort descending (z-a9-0).
     */
    sort(keyToSortBy, processes, doReverseOrder)
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

        const sortedProcesses = getProcessesSortedByKey(processes);
        const newSortedProcessesState = Object.assign(this.state, {
            processes: sortedProcesses
        });

        this.setState(newSortedProcessesState);
    }

    renderProcessHeaders(PROCESS_KEYS)
    {
        const self = this;

        return PROCESS_KEYS.map((procKey, index, array) =>
            <ProcessHeader
                key={index}
                procKey={procKey}
                sort={self.sort.bind(self)}
                processes={self.state.processes}
            />
        );
    }

    renderProcessData()
    {
        return this.state.processes.map((proc, index, array) =>
            <ProcessData
                key={index}
                name={proc.name}
                pid={proc.pid}
                sessionName={proc.sessionName}
                sessionNumber={proc.sessionNumber}
                memoryUsage={proc.memoryUsage}
            />
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

module.exports = Processes;

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
