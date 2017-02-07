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

/**
 * Creates a new object from a list of keys and a list of values by applying
 * the given function to each equally-positioned pair in the lists (key first).
 * Key/value pairing is truncated to the length of the shorter list.
 * @see R.zipWith
 * @see R.fromPairs @example [['a', 1], ['b', 2]] -> { a: 1, b: 2 }
 * @param {Function} fn - Input: [ keyN, valN ] Output: [ key, val ]
 * @param {Array[*]} keys - Array whose elements will be the keys.
 * @param {Array[*]} vals - Array whose elements will be the values.
 * @returns {Array} - The list made by combining same-index elements using <fn>.
 */
let zipObjBy, makeProcessObj = R.curry((fn, keys, vals) => {
    const customZipFunc = R.pipe(R.pair, fn);
    const arrayOfKeyValuePairs = R.zipWith(customZipFunc, keys, vals);
    const obj = R.fromPairs(arrayOfKeyValuePairs);
    return obj;
});

// <_sanitizers> only contains functions that clean the processes from `tasklist`.
const _sanitizers = Object.freeze(
{
    getProcessesAsArrays: R.pipe(
        R.split(OS.EOL),
        R.map(proc => JSON.parse(`[${proc}]`))
    ),

    getProcessesAsObjects: R.map(makeProcessObj(R.identity, PROCESS_KEYS)),

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
        (proc.name.endsWith('.exe') || proc.name.endsWith('.EXE'))
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

const result = getProcesses();
// console.log(result);

module.exports =
{
    getProcesses,
    PROCESS_KEYS,
    convertMemoryUsageToNumber,
    makeProcessObj
};

