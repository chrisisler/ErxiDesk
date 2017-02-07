'use strict';

const { getProcesses, PROCESS_KEYS } = require('./getProcesses.js');

const SearchInput = require('../search-input/SearchInput.js');
const ProcessHeader = require('./process-header/ProcessHeader.js');
const ProcessData = require('./process-data/ProcessData.js');

const R = require('ramda');
const React = require('react'),
      ReactDOM = require('react-dom');

class Processes extends React.Component
{
    constructor(props)
    {
        super(props);

        // These classes interact with _processes.scss and are used for CSS.
        this.hiddenProcessDataClass = 'hidden';
        this.noDisplayProcessDataClass = 'no-display';

        this.state = { processes: [] };
    }

    /**
     * Remove the given array of processes from this.state.processes and update state.
     * @param {Array[Object]} procsToRemove - Array of process objects.
     */
    removeProcesses(procsToRemove)
    {
        const procsWithRemovedProcs = R.without(procsToRemove, this.state.processes);
        this.setState({ processes: procsWithRemovedProcs });
    }

    /**
     * Add the given array of processes to this.state.processes and update state.
     * @param {Array[Object]} procsToInsert - Array of process objects.
     */
    insertProcesses(procsToInsert)
    {
        const procsWithInsertedProcs = [...procsToInsert, ...this.state.processes];
        this.setState({ processes: procsWithInsertedProcs });
    }

    /**
     * Call the given function on each table row node (process) whose PID matches
     * the <procsToMatch> pids.
     * @param {Array[Object]} procsToMatch - Array of process objects.
     * @param {Function} func - Passed each process row node with a matching `pid`.
     * @private
     */
    _getProcessDataRowNodes(procsToMatch, func)
    {
        // <procRowNodes> is this.state.processes as HTML elements/nodes.
        // TODO: How do I do this equivalent with React?
        const procRowNodes = document.getElementsByClassName('css-process-data');

        // [...<iterable>] converts some <iterable> to an array.
        [...procRowNodes].forEach(procRowNode =>
        {
            // Relies on `pid` property being a non-Number and second in the list.
            const pid = parseInt(procRowNode.childNodes[1].textContent);

            procsToMatch.forEach(procToMatch =>
            {
                if (pid === procToMatch.pid)
                {
                    func(procRowNode, procToMatch);
                }
            });
        });
    }

    /**
     * Given a process, check if that table row node (process) has the
     * this.hiddenProcessDataClass on it.
     * @param {Object} proc - A process object.
     * @returns {Boolean} - If the given process is hidden/dimmed or not.
     */
    processIsHidden(proc)
    {
        let procsAreHidden = false;

        this._getProcessDataRowNodes([ proc ], (procRowNode) =>
        {
            procsAreHidden = procRowNode.classList.contains(this.hiddenProcessDataClass);
        });

        return procsAreHidden;
    }

    /**
     * Given an array of processes, add the .hidden class to those <tr> elements.
     * @param {Array[Object]} procsToHide - Array of `process` objects.
     */
    hideProcesses(procsToHide)
    {
        this._getProcessDataRowNodes(procsToHide, (procRowNode) =>
        {
            procRowNode.classList.add(this.hiddenProcessDataClass);
        });
    }

    /**
     * Given an array of processes, remove the .hidden class from those <tr> elements.
     * @param {Array[Object]} procsToUnhide - Array of `process` objects.
     */
    unhideProcesses(procsToUnhide)
    {
        this._getProcessDataRowNodes(procsToUnhide, (procRowNode) =>
        {
            procRowNode.classList.remove(this.hiddenProcessDataClass);
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
     * of all processes of that name (mostly just combines the memory usage nums).
     * @param {String} processName - Name of a process.
     * @returns {Object} - A summarized "super" process.
     */
    getSummarizedProcess(processName)
    {
        const procsOfAName = this.getProcessesOfThisName(processName);

        if (procsOfAName.length === 1) { return procsOfAName[0]; }

        const summarizedProcess = {
            name: `${processName}* (${procsOfAName.length})`,
            pid: 0,
            memoryUsage: R.sum(procsOfAName.map(p => p.memoryUsage))
        };

        return summarizedProcess;
    }

    /** Sort procs by memUse by default. */
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
        this.setState({ processes: sortedProcs });
    }

    /**
     * When user searches for processes by name (string) or pid (number), add a class to the procs
     * that don't match that query which sets their `display: none` in css (see ./_Processes.scss).
     * @param {Object} event - keyboardEvent fired on the <input> element -> gives <searchQuery>.
     */
    searchProcesses(event)
    {
        const searchQuery = event.target.value;

        if (searchQuery.length === 0)
        {
            // Unhide all processes.
            this._getProcessDataRowNodes(this.state.processes, procRowNode =>
            {
                procRowNode.classList.remove(this.noDisplayProcessDataClass);
            });
        }
        else if (isNaN(searchQuery) && typeof searchQuery === 'string')
        {
            const procsNotMatchingQuery = this.state.processes
                .filter(proc => !proc.name.toLowerCase().includes(searchQuery.toLowerCase()));

            this._hideProcDataNodes(procsNotMatchingQuery);
        }
        else // searchQuery is a number -> user is searching for a pid.
        {
            const procsNotMatchingQuery = this.state.processes
                .filter(proc => !proc.pid.toString().includes(searchQuery.toString()));

            this._hideProcDataNodes(procsNotMatchingQuery);
        }

    }

    /**
     * Given an array of processes, apply `display: none` to each of those <tr> elements.
     * @param {Array[Objects]} doNotDisplayTheseProcs - Array of process objects.
     * @private
     */
    _hideProcDataNodes(doNotDisplayTheseProcs)
    {
        this._getProcessDataRowNodes(doNotDisplayTheseProcs, procRowNode =>
        {
            procRowNode.classList.add(this.noDisplayProcessDataClass);
        });
    }

    /**
     * Every character entered into the "show top N" input must be a number.
     * @param {String} value - event.target.value from an <input/> element.
     * @returns {Boolean} - True if all chars in <value> are integers.
     */
    validateShowTopNProcessesInput(value)
    {
        const characters = value.split('');
        const isNumber = R.match(/\d/);

        return R.all(isNumber)(characters);
    }

    /**
     * When user types in "Show top N" SearchInput, they only want to see those num
     * of processes. Given that keyboard event, display this top N processes.
     * @param {Object} event - A keyboard event from the <input/> element.
     */
    showTopNProcesses(event)
    {
        const numberOfProcsToDisplay = event.target.value;

        this._getProcessDataRowNodes(this.state.processes, procRowNode =>
        {
            procRowNode.classList.remove(this.noDisplayProcessDataClass);
        });

        if (numberOfProcsToDisplay.length > 0)
        {
            const procsToHide = R.drop(numberOfProcsToDisplay, this.state.processes);
            this._hideProcDataNodes(procsToHide);
        }
    }

    /**
     * Grab a fresh batch of processes from getProcesses.js.
     * Updates state.
     */
    refreshProcesses()
    {
        this.setState({ processes: [] });

        this.setState({ processes: getProcesses() }, () =>
        {
            this.sortProcesses('memoryUsage', true);
        });
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
                key={index + ' ' + procKey}
                procKey={procKey}
                sortProcesses={this.sortProcesses.bind(this)}
            />
        );
    }

    /**
     * Accesses <this.state.processes> to return an array of <ProcessData>.
     * @param {Array[Object]} _processes - A reference to this.state.processes
     * @returns {Array[<ProcessData>]} - Array of <ProcessData> UI components.
     */
    renderProcessData(_processes)
    {
        return _processes.map((proc, index, array) =>
            <ProcessData
                key={index + ' ' + proc.pid}
                processData={proc}
                getSummarizedProcess={this.getSummarizedProcess.bind(this)}
                getProcessesOfThisName={this.getProcessesOfThisName.bind(this)}
                removeProcesses={this.removeProcesses.bind(this)}
                insertProcesses={this.insertProcesses.bind(this)}
                hideProcesses={this.hideProcesses.bind(this)}
                unhideProcesses={this.unhideProcesses.bind(this)}
                processIsHidden={this.processIsHidden.bind(this)}
            />
        );
    }

    renderElementsAboveTable()
    {
        return (
            <div className='css-process-above'>
                <SearchInput
                    className='css-process-search'
                    placeholder='Search name/pid'
                    handleSearchQuery={this.searchProcesses.bind(this)}
                />

                <i
                    className='material-icons css-process-refresh'
                    onClick={this.refreshProcesses.bind(this)}
                >
                    cached
                </i>

                <span className='css-process-number'>
                    {this.state.processes.length + ' Processes listed'}
                </span>

                <SearchInput
                    className='css-process-show-N'
                    placeholder='Show # processes'
                    handleSearchQuery={this.showTopNProcesses.bind(this)}
                    validateInput={this.validateShowTopNProcessesInput.bind(this)}
                />
            </div>
        );
    }

    render()
    {
        return (
            <div className='css-container'>

                {this.renderElementsAboveTable()}

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

