/**
 * This file exports a list of objects representing the
 * currently running processes on this machine.
 */

/**
 * 1. Grab processes on this computer with `tasklist`.
 * 2. Create functions to filter the processes (via pipeline).
 * 3. Return the filtered processes.
 */

// TODO: Use more Ramda in place of native functions.

'use strict';

const R = require('ramda');
const CP = require('child_process');
const OS = require('os');

const PROCESS_KEYS = [ 'name', 'pid', 'sessionName', 'sessionNumber', 'memoryUsage' ];

// Convert `tasklist` output to an array of strings.
const getProcessesAsArrays = R.pipe(
    R.split(OS.EOL), // Windows only, but no need to hard-code CRLF.
    R.map(process => JSON.parse('[' + process + ']'))
);

// Input from <getProcessesAsArrays()>.
const getProcessesAsObjects = R.pipe(
    R.map(processAsArray =>
    {
        const processAsObject = {};
        processAsArray.forEach((processValue, index, array) =>
        {
            // In <PROCESS_KEYS>, the elements are ordered the same as the column
            // headers when executing the `tasklist` command on a Windows machine.
            // These names are used as keys to convert each process from a list
            // of values to an object with key-value pairs.
            processAsObject[PROCESS_KEYS[index]] = processValue;
        });
        return processAsObject;
    })
);

// Convert process.pid from (string) '8442' to (number) 8442.
// Also convert process.sessionNumber to a number.
const convertPidAndSessionNumberToNumber = R.pipe(
    R.map((process) =>
    {
        process.pid = Number.parseInt(process.pid);
        process.sessionNumber = Number.parseInt(process.sessionNumber);
        return process;
    })
);

// Convert process.memoryUsage from (string) '38,723 K' to 38723 (number).
const convertMemoryUsageToNumber = R.pipe(
    R.forEach((process) =>
    {
        let memUse = process.memoryUsage;
        memUse = memUse.substr(0, memUse.length - 2);  // Remove ' K'.
        memUse = memUse.replace(/,/, '');              // Remove ','.
        process.memoryUsage = Number.parseInt(memUse); // String to Integer.
    })
);

const removeExeFromProcessNames = R.pipe(
    R.forEach((process) =>
    {
        if (process.name.endsWith('.exe'))
        {
            process.name = R.replace(/\.exe/i, '')(process.name);
        }
    })
);

// TODO: There's probably a better way to do this.
const removeBrokenProcesses = R.pipe(
    R.filter(p => !!p.name
            && !!p.pid
            && !!p.sessionName
            && !!p.sessionNumber
            && !!p.memoryUsage
    )
);

function getProcesses()
{
    // Get output from `tasklist` command as one big string.
    const processes = CP.execSync('tasklist /fo csv /nh', { encoding: 'utf8' });

    // Clean up the data and return.
    const pipeline = R.pipe(
        getProcessesAsArrays,
        getProcessesAsObjects,
        removeBrokenProcesses,
        removeExeFromProcessNames,
        convertPidAndSessionNumberToNumber,
        convertMemoryUsageToNumber
    );

    return pipeline(processes);
}

const pipeline = R.pipe(
    R.identity
);

let input = getProcesses();
const result = pipeline(input);
// console.log(result);

// ES6 object syntax
module.exports =
{
    getProcesses,
    PROCESS_KEYS
};

