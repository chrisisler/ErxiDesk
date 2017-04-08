'use strict';

const _killProcesses = require('./killProcesses.js');
const { getProcessesSync, getProcessesAsync, PROCESS_KEYS } = require('./getProcesses.js');

/* eslint-disable no-unused-vars */
const SearchInput = require('../search-input/SearchInput.js');
const ProcessHeader = require('./process-header/ProcessHeader.js');
const ProcessData = require('./process-data/ProcessData.js');

const R = require('ramda');
const React = require('react');

/**
 * Return <objects> whose values of <prop> don't include <searchQuery>.
 * With a <transform> function applied to <searchQuery> and each <objects>.
 * @see R.reject (reject is the opposite of filter)
 * @param {String} prop - A key of an obj in <objects>.
 * @param {String} searchQuery - Value of an obj in <objects> to search for.
 * @param {Function} transform - Applied to each <objects> and to <searchQuery>.
 * @param {Array[Object]} objects - List of elements to filter through.
 * @returns {Array[Object]} - <objects> with <prop> whose value does NOT contain <searchQuery>.
 */
const rejectPropMatches = R.curryN(4, (prop, searchQuery, transform, objects) =>
{
    const _rejectPropMatches = R.reject(
        R.pipe(
            R.prop(prop),
            transform,
            R.contains(transform(searchQuery))
        )
    );
    return _rejectPropMatches(objects);
});

/**
 * Apply <fn> to each table row element whose PID matches the <procObjs> pids.
 * @param {Array[Object]} procObjs - Array of process objects.
 * @param {Function} fn - Applied to each table row node with a matching `pid` prop.
 */
function givenEachProcAsTableRow(procObjs, fn)
{
    // [...<iterable>] converts some iterable to an array.
    [...document.getElementsByClassName('css-process-data')].forEach(procDataTableRowNode =>
    {
        // Relies on the `pid` property being second in the list.
        const procDataTableRowNodePID = procDataTableRowNode.childNodes[1].textContent;

        procObjs.forEach(procObj =>
        {
            if (procDataTableRowNodePID == procObj.pid) // Solves a Number vs. String issue.
            {
                fn(procDataTableRowNode, procObj);
            }
        });
    });
}

class Processes extends React.Component
{
    constructor(props)
    {
        super(props);

        // These classes interact with _processes.scss and are used for CSS.
        this.hiddenProcessDataClass = 'hidden';
        this.noDisplayProcessDataClass = 'no-display';

        this.state = {
            processes: [],
            keyToSortBy: 'memoryUsage',
            doReverseOrder: true
        };
    }

    /**
     * Remove the given array of processes from this.state.processes and update state.
     * @param {Array[Object]} procsToRemove - Array of process objects.
     */
    removeProcesses(procsToRemove)
    {
        const procsWithRemovedProcs = R.without(procsToRemove, this.state.processes);
        this.setState(() => ({ processes: procsWithRemovedProcs }));
    }

    /**
     * Add the given array of processes to this.state.processes and update state.
     * @param {Array[Object]} procsToInsert - Array of process objects.
     */
    insertProcesses(procsToInsert)
    {
        const procsWithInsertedProcs = [...procsToInsert, ...this.state.processes];
        this.setState(() => ({ processes: procsWithInsertedProcs }));
    }

    killProcesses(procsToKill)
    {
        // TODO: Is there a better way to do this?
        _killProcesses(procsToKill)
            .then(() =>
            {
                this.refreshProcesses();
            })
            .then(() =>
            {
                this.removeProcesses(procsToKill);
            })
            .catch(error =>
            {
                throw error;
            });
    }

    clearInputs()
    {
        const noValue = { value: '' };

        if (this.searchProcessesInput.state.value !== '')
        {
            this.searchProcessesInput.setState(() => noValue);
        }
        if (this.showProcessesInput.state.value !== '')
        {
            this.showProcessesInput.setState(() => noValue);
        }
    }

    /**
     * Given a process, check if that table row node (process) has the
     * this.hiddenProcessDataClass on it.
     * @param {Object} proc - A process object.
     * @returns {Boolean} - If the given process is hidden/dimmed or not.
     */
    processIsHidden(proc)
    {
        let procIsHidden = false;

        givenEachProcAsTableRow([ proc ], (procRowNode) =>
        {
            procIsHidden = procRowNode.classList.contains(this.hiddenProcessDataClass);
        });

        return procIsHidden;
    }

    /**
     * Given an array of processes, add the .hidden class to those <tr> elements.
     * @param {Array[Object]} procsToHide - Array of `process` objects.
     */
    hideProcesses(procsToHide)
    {
        givenEachProcAsTableRow(procsToHide, (procRowNode) =>
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
        givenEachProcAsTableRow(procsToUnhide, (procRowNode) =>
        {
            procRowNode.classList.remove(this.hiddenProcessDataClass);
        });
    }

    /**
     * @param {Object} process - A process obj.
     * @returns {Array[Object]} - All procs with that name.
     */
    getSameNameProcesses(process)
    {
        return this.state.processes.filter(p => p.name === process.name);
    }

    /**
     * Given the name of a process, if there is more than one occurrence of that
     * process, create and return a custom process object from the combination
     * of all processes of that name (mostly just combines the memory usage nums).
     * @param {Object} process - A process object.
     * @returns {Object} - A summarized "super" process.
     */
    getSummatedProcess(process)
    {
        const sameNameProcs = this.getSameNameProcesses(process);

        if (sameNameProcs.length === 1)
        {
            return sameNameProcs[0];
        }

        return {
            name: `${process.name}* [${sameNameProcs.length}]`,
            pid: 0,
            memoryUsage: R.sum(R.pluck('memoryUsasge', sameNameProcs))
        };
    }

    /** Sort procs by memUse by default. */
    componentDidMount()
    {
        this.setState(() => ({ processes: getProcessesSync() }), () =>
        {
            this.sortProcesses();
        });
    }

    /**
     * sortProcesses and update state based on received arguments
     * This.state.processes are sorted by a key, <keyToSortBy>.
     * @param {String} keyToSortBy - Key of a <process> obj to sortProcesses by.
     * @param {Boolean} doReverseOrder - If true, then sort ascending.
     * @returns sortedProcesses - The given <processes> sorted by <keyToSortBy>.
     */
    sortProcesses(keyToSortBy, doReverseOrder)
    {
        keyToSortBy = keyToSortBy || this.state.keyToSortBy;
        doReverseOrder = doReverseOrder || this.state.doReverseOrder;

        const sortValue = this.state.processes[0][keyToSortBy];
        const ifSortValueIsStringFunc = R.partial(R.is(String), [sortValue]);
        const reverseOrNot = doReverseOrder ? R.reverse : R.identity;

        const getProcessesSortedByKey = R.pipe(
            R.sortBy(
                R.ifElse(
                    ifSortValueIsStringFunc,
                    R.pipe(R.prop(keyToSortBy), R.toLower),
                    R.prop(keyToSortBy)
                )
            ),
            reverseOrNot
        );

        // Cache the result of the sort in this.state and update state.
        this.setState(() => ({
            processes: getProcessesSortedByKey(this.state.processes),
            keyToSortBy,
            doReverseOrder: !doReverseOrder
        }));
    }

    /**
     * This func is different from <unhideProcesses>.
     * This func removes the `no-display` class from every process.
     */
    redisplayAllProcs()
    {
        givenEachProcAsTableRow(this.state.processes, procRowNode =>
        {
            procRowNode.classList.remove(this.noDisplayProcessDataClass);
        });
    }

    /**
     * When user searches for processes by name (string) or pid (number), add a class to the procs
     * that don't match that query which sets their `display: none` in css (see ./_Processes.scss).
     * @param {Object} event - keyboardEvent fired on the <input> element produces <searchQuery>.
     */
    searchProcesses(event)
    {
        const searchQuery = event.target.value;
        const procs = this.state.processes;

        if (searchQuery.length === 0)
        {
            this.redisplayAllProcs(); // Unhide all processes.
        }
        else if (isNaN(searchQuery) && typeof searchQuery === 'string')
        {
            const procsNotMatchingQuery = rejectPropMatches('name', searchQuery, R.toLower, procs);
            this._hideProcDataNodes(procsNotMatchingQuery);
        }
        else if (Number.isInteger(Number(searchQuery)))
        {

            const procsNotMatchingQuery = rejectPropMatches('pid', Number(searchQuery), R.toString, procs);
            this._hideProcDataNodes(procsNotMatchingQuery);
        }
        else
        {
            throw new TypeError('searchQuery is invalid');
        }

    }

    /**
     * Given an array of processes, apply `display: none` to each of those <tr> elements.
     * @param {Array[Objects]} doNotDisplayTheseProcs - Array of process objects.
     * @private
     */
    _hideProcDataNodes(doNotDisplayTheseProcs)
    {
        givenEachProcAsTableRow(doNotDisplayTheseProcs, (procRowNode) =>
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
        const characters = R.split('', value);
        const isNum = R.match(/\d/);
        return R.all(isNum, characters);
    }

    /**
     * When user types in "Show top N" SearchInput, they only want to see those num
     * of processes. Given that keyboard event, display this top N processes.
     * @param {Object} event - A keyboard event from the <input/> element.
     */
    showTopNProcesses(event)
    {
        const numberOfProcsToDisplay = Number(event.target.value);

        this.redisplayAllProcs();

        if (numberOfProcsToDisplay.length > 0)
        {
            const procsToHide = R.drop(numberOfProcsToDisplay, this.state.processes);
            this._hideProcDataNodes(procsToHide);
        }
    }

    showNotification()
    {
        const ReactDOM = require('react-dom');
        const Notification = require('../notification/Notification.js');

        const notif = <Notification/>;
        ReactDOM.render(notif, document.getElementById('notification'));
    }

    refreshProcesses()
    {
        getProcessesAsync().then(processes =>
        {
            this.setState(() => ({ processes }), () =>
            {
                this.sortProcesses(this.state.keyToSortBy, !this.state.doReverseOrder);
                this.clearInputs();
            });
        }).done();
    }

    /**
     * Given the <PROCESS_KEYS>, return the <ProcessHeader> components.
     * @param {Array[String]} PROCESS_KEYS - Array of keys of a <process> obj.
     * @returns {Array[<ProcessHeader>]} - The <ProcessHeader> UI components.
     */
    renderProcessHeaders(PROCESS_KEYS)
    {
        /* eslint-disable no-unused-vars */
        return PROCESS_KEYS.map((procKey, index) =>
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
        /* eslint-disable no-unused-vars */
        return _processes.map((proc, index) =>
            <ProcessData
                key={index + ' ' + proc.memoryUsage}
                processData={proc}
                getSummatedProcess={this.getSummatedProcess.bind(this)}
                getSameNameProcesses={this.getSameNameProcesses.bind(this)}
                removeProcesses={this.removeProcesses.bind(this)}
                insertProcesses={this.insertProcesses.bind(this)}
                hideProcesses={this.hideProcesses.bind(this)}
                unhideProcesses={this.unhideProcesses.bind(this)}
                processIsHidden={this.processIsHidden.bind(this)}
                killProcesses={this.killProcesses.bind(this)}
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
                    ref={input => this.searchProcessesInput = input}
                />

                <i
                    className='material-icons css-process-refresh'
                    onClick={this.refreshProcesses.bind(this)}
                >
                    cached
                </i>
                <i
                    className='material-icons css-process-refresh'
                    onClick={this.showNotification.bind(this)}
                >
                    menu
                </i>

                <span className='css-process-number'>
                    {this.state.processes.length + ' Processes'}
                </span>

                <SearchInput
                    className='css-process-show-N'
                    placeholder='Show # processes'
                    handleSearchQuery={this.showTopNProcesses.bind(this)}
                    validateInput={this.validateShowTopNProcessesInput.bind(this)}
                    ref={input => this.showProcessesInput = input}
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

