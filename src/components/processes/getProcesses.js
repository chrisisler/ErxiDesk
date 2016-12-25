/**
 * This file exports a list of objects representing the currently running
 * processes on this machine.
 *
 * Capture output from `tasklist` -> sanitize and organize -> return/export data.
 *
 * If you only care about what this file does and not how it does it, just read
 * the first function below: "getProcesses()"
 */

'use strict';

const R = require('ramda');
const CP = require('child_process');
const OS = require('os');

const PROCESS_KEYS = [ 'name', 'pid', 'sessionName', 'sessionNumber', 'memoryUsage' ];

function getProcesses()
{
    // Get output from `tasklist` command as one big string.
    const dirtyProcesses = CP.execSync('tasklist /fo csv /nh', { encoding: 'utf8' });

    // The argument to each function in this pipeline below is <dirtyProcesses>.
    // Each function below returns a function which acts on the output from the
    //   previous function. (Do this, then do this, then do this, one at a time.)
    // Clean up the data and return.
    const sanitize = R.pipe(
        _getProcessesAsArrays(),
        _getProcessesAsObjects(),
        _removeBrokenProcesses(),
        _removeExeFromProcessNames(),
        _convertPidAndSessionNumberToNumber(),
        _convertMemoryUsageToNumber()
    );

    const cleanProcesses = sanitize(dirtyProcesses);
    return cleanProcesses;
}
function _getProcessesAsArrays()
{
    return R.pipe(
        R.split(OS.EOL),
        R.map(proc => JSON.parse(`[${proc}]`))
    );
}

function getNewProcess()
{
    ;
}

function _getProcessesAsObjects()
{
    return R.map(procAsArray =>
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
    });
}

function _convertPidAndSessionNumberToNumber()
{
    return R.map((proc) =>
    {
        proc.pid = Number.parseInt(proc.pid);
        proc.sessionNumber = Number.parseInt(proc.sessionNumber);
        return proc;
    });
}

function _convertMemoryUsageToNumber()
{
    return R.forEach((proc) =>
    {
        let memUse = proc.memoryUsage;
        memUse = memUse.substr(0, memUse.length - 2);  // Remove ' K'.
        memUse = memUse.replace(/,/, '');              // Remove ','.
        proc.memoryUsage = Number.parseInt(memUse); // String to Integer.
    });
}

function _removeExeFromProcessNames()
{
    return R.forEach((proc) =>
    {
        if (proc.name.endsWith('.exe'))
        {
            proc.name = R.replace(/\.exe/i, '')(proc.name);
        }
    })
}

// TODO: There's probably a better way to do this.
function _removeBrokenProcesses()
{
    return R.filter(proc =>
        !!proc.name
        && !!proc.pid
        && !!proc.sessionName
        && !!proc.sessionNumber
        && !!proc.memoryUsage
    );
}

// ES6 object syntax
module.exports =
{
    getProcesses,
    PROCESS_KEYS
};


