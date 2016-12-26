/**
 * This file exports a list of objects representing the currently running
 * processes on this machine.
 *
 * Capture `tasklist` output -> sanitize data -> export data.
 *
 * Just read the getProcesses() function at the bottom of this file.
 */

'use strict';

const R = require('ramda');
const CP = require('child_process');
const OS = require('os');

const PROCESS_KEYS = [ 'name', 'pid', 'sessionName', 'sessionNumber', 'memoryUsage' ];

const _sanitizers = Object.freeze(
{
    getProcessesAsArrays: R.pipe(
        R.split(OS.EOL),
        R.map(proc => JSON.parse(`[${proc}]`))
    ),

    getProcessesAsObjects: R.map(procAsArray =>
    {
        return makeProcessObj(procAsArray, PROCESS_KEYS, elem => elem);
    }),

    convertPidAndSessionNumberToNumber: R.map(proc => Object.assign(proc,
    {
        pid: Number.parseInt(proc.pid),
        sessionNumber: Number.parseInt(proc.sessionNumber)
    })),

    convertMemoryUsageToNumberMultiple: R.map(proc =>
        convertMemoryUsageToNumber(proc, PROCESS_KEYS)
    ),

    removeExeFromProcessNames: R.map(proc =>
        proc.name.endsWith('.exe')
            ? Object.assign(proc, { [PROCESS_KEYS[0]]: proc.name.replace(/\.exe/i, '') })
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

function makeProcessObj(array, PROCESS_KEYS, func)
{
    let processObj = {};
    array.forEach((elem, index, array) =>
    {
        processObj[PROCESS_KEYS[index]] = func(elem);
    });
    return processObj;
}

function convertMemoryUsageToNumber(proc, PROCESS_KEYS)
{
    const oldMemUse = proc.memoryUsage;
    const newMemUse = Number.parseInt(
        oldMemUse
            .substr(0, oldMemUse.length - 2) // Remove " K"
            .replace(/,/, '')
    );
    return Object.assign(proc, { memoryUsage: newMemUse });
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
        _sanitizers.removeExeFromProcessNames,
        _sanitizers.convertPidAndSessionNumberToNumber,
        _sanitizers.convertMemoryUsageToNumberMultiple
    );

    const cleanProcesses = sanitize(dirtyProcesses);
    return cleanProcesses;
}

// ES6 object syntax
module.exports =
{
    getProcesses,
    PROCESS_KEYS,
    convertMemoryUsageToNumber,
    makeProcessObj
};

