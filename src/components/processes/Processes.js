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

        this.state = { processes: [] };
    }

    getProcessesOfThisName(processName)
    {
        return this.state.processes.filter(p => p.name === processName);
    }

    getSummarizedProcess(processName)
    {
        const allProcessesOfThisName = this.getProcessesOfThisName(processName);

        if (allProcessesOfThisName.length === 1)
        {
            return allProcessesOfThisName[0];
        }

        const summarizedProcess = {
            name: processName,
            pids: allProcessesOfThisName.map(proc => proc.pid),
            sessionName: allProcessesOfThisName[0].sessionName,
            sessionNumber: allProcessesOfThisName[0].sessionNumber,
            memoryUsage: allProcessesOfThisName.reduce(
                (totalMemUse, proc) => totalMemUse + proc.memoryUsage, 0
            ),
            numOccurrences: allProcessesOfThisName.length
        };

        return summarizedProcess;
    }

    componentDidMount()
    {
        this.sortProcesses('memoryUsage', true);
    }

    /**
     * sortProcesses and update <processes> sorted by a key, <keyToSortBy>.
     * @param {String} keyToSortBy - Key of a <process> obj to sortProcesses by.
     * @param {Boolean} doReverseOrder - If true, then sort descending.
     * @returns sortedProcesses - The given <processes> sorted by <keyToSortBy>.
     */
    sortProcesses(keyToSortBy, doReverseOrder)
    {
        // If this.state.processes has not been initialized, let this functions
        // working array of processes be a fresh copy from getProcesses().
        const _processes = this.state.processes.length ? this.state.processes : getProcesses();

        const sortValue = _processes[0][keyToSortBy];
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

        this.setState((previousState, previousProps) =>
            Object.assign({}, previousState, {
                processes: getProcessesSortedByKey(_processes)
            })
        );
    }

    /**
     * Given the <PROCESS_KEYS>, return the <ProcessHeader> components.
     * @param {Array[String]} PROCESS_KEYS - Array of keys of a <process> obj.
     * @returns {Array[<ProcessHeader>]} - The <ProcessHeader> UI components.
     */
    renderProcessHeaders(PROCESS_KEYS)
    {
        return PROCESS_KEYS.map((procKey, index, array) =>
            <ProcessHeader
                key={index}
                procKey={procKey}
                sortProcesses={this.sortProcesses.bind(this)}
            />
        );
    }

    /**
     * Accesses <this.state.processes> to return an array of <ProcessData>.
     * @returns {Array[<ProcessData>]} - The <ProcessData> UI components.
     */
    renderProcessData()
    {
        return this.state.processes.map((proc, index, array) =>
        {
            // proc.memoryUsage = proc.memoryUsage.toLocaleString() + ' K';

            return <ProcessData
                key={index}
                processData={proc}
                getSummarizedProcess={this.getSummarizedProcess.bind(this)}
                getProcessesOfThisName={this.getProcessesOfThisName.bind(this)}
            />
        });
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


// getTotalMemoryUsage(processName)
// {
//     return R.pipe(
//         R.filter(proc => R.propEq('name', processName)(proc)),
//         R.map(proc => proc.memoryUsage),
//         R.reduce((totalMemUse, memUse) => total + memUse, 0)
//     )(this.state.processes);
// }

