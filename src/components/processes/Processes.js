'use strict';

const { getProcesses, PROCESS_KEYS } = require('./getProcesses.js');
const Util = require('../../util/util.js');

const ProcessHeader = require('./process-header/ProcessHeader.js');
const ProcessData = require('./process-data/ProcessData.js');
const Dropdown = require('../dropdown/Dropdown.js');

const R = require('ramda');
const React = require('react'),
      ReactDOM = require('react-dom');

class Processes extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = { processes: [] };
    }

    /**
     * Update state after removing the given array of procs.
     * @param {Array[Object]} procsToRemove - Array of process objects.
     */
    removeProcesses(procsToRemove)
    {
        const procsWithRemovedProcs = R.without(procsToRemove, this.state.processes);
        this.updateProcessesState(procsWithRemovedProcs);
    }

    /**
     * Adds the given <procsToInsert> to this.state and updates state.
     * @param {Array[Object]} procsToInsert - Array of process objects.
     */
    insertProcesses(procsToInsert)
    {
        const procsWithInsertedProcs = [...procsToInsert, ...this.state.processes];
        this.updateProcessesState(procsWithInsertedProcs);
    }

    /**
     * Given an array of processes, add the .hidden class to that <tr> element.
     * @param {Array[Object]} procsToHide - Array of `process` objects.
     */
    hideProcesses(procsToHide)
    {
        const procRowNodes = document.getElementsByClassName('css-process-data');

        [...procRowNodes].forEach(procRowNode =>
        {
            // Relies on the fact that the `name` property is the first in the list.
            const procName = procRowNode.childNodes[0].textContent;

            procsToHide.forEach(procToHide =>
            {
                if (procName === procToHide.name)
                {
                    procRowNode.classList.add('hidden');
                }
            });
        });
    }

    /**
     * Given the name of a process, return all processes in this.state.processes
     * that share that name.
     * @param {String} processName - The `name` property of a process obj.
     * @returns {Array[Object]} - All procs with that name.
     */
    getProcessesOfThisName(processName)
    {
        return this.state.processes.filter(p => p.name === processName);
    }

    /**
     * Given the name of a process, if there is more than one occurrence of that
     * process, create and return a custom process object from the combination
     * of all processes of that name.
     * @param {String} processName - Name of a process.
     * @returns {Object} - A summarized "super" process.
     */
    getSummarizedProcess(processName)
    {
        const allProcessesOfThisName = this.getProcessesOfThisName(processName);

        if (allProcessesOfThisName.length === 1)
        {
            return allProcessesOfThisName[0];
        }

        const summarizedProcess = {
            name: `${processName}* (${allProcessesOfThisName.length})`,
            pid: 0,
            sessionName: allProcessesOfThisName[0].sessionName,
            sessionNumber: allProcessesOfThisName[0].sessionNumber,
            memoryUsage: allProcessesOfThisName.reduce(
                (totalMemUse, proc) => totalMemUse + proc.memoryUsage , 0
            )
        };

        return summarizedProcess;
    }

    componentDidMount()
    {
        const doSortFromLastToFirst = true;
        this.sortProcesses('memoryUsage', doSortFromLastToFirst);
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
        // Note: This is probably not the smartest place to do that, but it works.
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

        const sortedProcs = getProcessesSortedByKey(_processes);
        this.updateProcessesState(sortedProcs);
    }

    /**
     * Given a new batch of process objects, <newProcesses>, update this.state.
     * @param {Array[Object]} - New set of <processes> to call on this.setState().
     */
    updateProcessesState(newProcesses)
    {
        this.setState((previousState, previousProps) =>
            Object.assign({}, previousState, {
                processes: newProcesses
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
     * @param {Array[Object]} _processes - this.state.processes
     * @returns {Array[<ProcessData>]} - Array of <ProcessData> UI components.
     */
    renderProcessData(_processes)
    {
        return _processes.map((proc, index, array) =>
            <ProcessData
                key={index}
                processData={proc}
                getSummarizedProcess={this.getSummarizedProcess.bind(this)}
                getProcessesOfThisName={this.getProcessesOfThisName.bind(this)}
                removeProcesses={this.removeProcesses.bind(this)}
                insertProcesses={this.insertProcesses.bind(this)}
                hideProcesses={this.hideProcesses.bind(this)}
            />
        );
    }

    render()
    {
        // <div>
        //     <a>Search Bar</a>
        //     <a>Refresh Processes UI Button</a>
        //     <a>Total Number of Processes</a>
        // </div>

        return (
            <div className='css-container'>
                <table className='css-process-wrap'>

                    <thead className='css-process-header-wrap'>
                        <tr>
                            {this.renderProcessHeaders(PROCESS_KEYS)}
                        </tr>
                    </thead>

                    <tbody>
                        {this.renderProcessData(this.state.processes)}
                    </tbody>

                </table>
            </div>
        );
    }
}

Processes.propTypes = {};
Processes.defaultProps = {};

module.exports = Processes;

