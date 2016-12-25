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
        const procAsObject = {};
        procAsArray.forEach((procValue, index, array) =>
        {
            // In <PROCESS_KEYS>, the elements are ordered the same as the column
            // headers when executing the `tasklist` command on a Windows machine.
            // These names are used as keys to convert each process from a list of
            // values to an object.
            procAsObject[PROCESS_KEYS[index]] = procValue;
        });
        return procAsObject;
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

function convertMemoryUsageToNumber(proc, PROCESS_KEYS)
{
    const oldMemUse = proc.memoryUsage;
    const newMemUse = Number.parseInt(
        oldMemUse
            .substr(0, oldMemUse.length - 2) // Remove " K"
            .replace(/,/, '')
    );
    return Object.assign(proc, { [PROCESS_KEYS[4]]: newMemUse });
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
    convertMemoryUsageToNumber
};

