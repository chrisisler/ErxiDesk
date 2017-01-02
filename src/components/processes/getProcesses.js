/**
 * This file exports a list of the currently running processes on this machine.
 * Just read the getProcesses() function at the bottom of this file.
 *
 * Capture `tasklist` output -> sanitize data -> export data.
 */

'use strict';

const R = require('ramda');
const CP = require('child_process');
const OS = require('os');

const PROCESS_KEYS = [ 'name', 'pid', 'sessionName', 'sessionNumber', 'memoryUsage' ];

// <_sanitizers> only contains functions that clean the processes from `tasklist`.
const _sanitizers = Object.freeze(
{
    getProcessesAsArrays: R.pipe(
        R.split(OS.EOL),
        R.map(proc => JSON.parse(`[${proc}]`))
    ),

    getProcessesAsObjects: R.map(procAsArray =>
        makeProcessObj(procAsArray, PROCESS_KEYS, R.identity)
    ),

    convertPidAndSessionNumberToNumber: R.map(proc =>
        Object.assign({}, proc,
        {
            pid: Number.parseInt(proc.pid),
            sessionNumber: Number.parseInt(proc.sessionNumber)
        })
    ),

    convertMemoryUsageToNumberMultiple: R.map(proc =>
        convertMemoryUsageToNumber(proc)
    ),

    removeExeFromNames: R.map(proc =>
        proc.name.endsWith('.exe')
            ? Object.assign({}, proc, { name: proc.name.replace(/\.exe/i, '') })
            : proc
    ),

    removeBrokenProcesses: R.filter(proc =>
        !!proc.name
        && !!proc.pid
        && !!proc.sessionName
        && !!proc.sessionNumber
        && !!proc.memoryUsage
    )
});

/**
 * Returns a new <process> obj with keys from <array[i]> and values from func(array[i]).
 * @param {Array[String|Number]} array - Items are keys of <newProcessObj>, in order.
 * @param {Array[String]} PROCESS_KEYS - Array of keys of a <process> object.
 * @param {Function} func - Given each <array[i]>, returns a value.
 * @returns newProcessObj - A <process> object.
 */
function makeProcessObj(array, PROCESS_KEYS, func)
{
    let newProcessObj = {};
    array.forEach((elem, index, array) =>
    {
        const key = PROCESS_KEYS[index];
        newProcessObj[key] = func(elem);
    });

    newProcessObj = _sanitizers.convertPidAndSessionNumberToNumber([newProcessObj])[0];

    return newProcessObj;
}

/**
 * Return a copy of the given <proc> with its memoryUsage property as a Number.
 * @param {Object} proc - A <process> obj with memoryUsage property as a String.
 * @param {Array[String|Number]} array - Array whose elements will be the values.
 * @returns updatedProc - A <process> obj with memoryUsage property as a Number.
 */
function convertMemoryUsageToNumber(proc)
{
    const oldMemUse = proc.memoryUsage;
    const newMemUse = Number.parseInt(
        oldMemUse
            .substr(0, oldMemUse.length - 2) // Remove " K"
            .replace(/,/, '')
    );

    const updatedProc = Object.assign({}, proc, { memoryUsage: newMemUse });

    return updatedProc;
}

function getProcesses()
{
    // Get output from `tasklist` command as one big string.
    const dirtyProcesses = CP.execSync('tasklist /fo csv /nh', { encoding: 'utf8' });

    // Each function below returns a function which acts on the output from the
    //   previous function. (Do this, then do this, then do this, one at a time.)
    // Clean up the data and return.
    const sanitize = R.pipe(
        _sanitizers.getProcessesAsArrays,
        _sanitizers.getProcessesAsObjects,
        _sanitizers.removeBrokenProcesses,
        _sanitizers.removeExeFromNames,
        _sanitizers.convertPidAndSessionNumberToNumber,
        _sanitizers.convertMemoryUsageToNumberMultiple
    );

    const cleanProcesses = sanitize(dirtyProcesses);
    return cleanProcesses;
}

function getSummarizedProcess(processName, processes)
{
    const processesOfThisName = processes.filter(proc => proc.name === processName)

    if (processesOfThisName.length === 1)
    {
        return processesOfThisName[0];
    }

    const summarizedProcess = {
        name: processName,
        pids: processesOfThisName.map(proc => proc.pid),
        sessionName: processesOfThisName[0].sessionName,
        sessionNumber: processesOfThisName[0].sessionNumber,
        memoryUsage: processesOfThisName.reduce((totalMemUse, proc) => totalMemUse + proc.memoryUsage, 0),
        numberOfOccurrences: processesOfThisName.length
    };

    return summarizedProcess;
}

module.exports =
{
    getProcesses,
    PROCESS_KEYS,
    convertMemoryUsageToNumber,
    makeProcessObj
};

