/**
 * This file exports a list of objects representing the
 * currently running processes on this machine.
 */

'use strict';

const R = require('ramda');
const CP = require('child_process');
const OS = require('os');

const PROCESS_KEY_NAMES = [ 'name', 'pid', 'sessionName', 'sessionNumber', 'memoryUsage' ];

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
            // In <PROCESS_KEY_NAMES>, the elements are ordered the same as the column
            // headers when executing the `tasklist` command on a Windows machine.
            // These names are used as keys to convert each process from a list
            // of values to an object with key-value pairs.
            processAsObject[PROCESS_KEY_NAMES[index]] = processValue;
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
        memUse = memUse.replace(/,/, '')               // Remove ','.
        process.memoryUsage = Number.parseInt(memUse); // String to Integer.
    })
);

const removeExeFromProcessNames = R.pipe(
    R.forEach((process) =>
    {
        if (process.name.endsWith('.exe'))
        {
            process.name = process.name.replace(/\.exe/i, '');
        }
    })
);

const removeBrokenProcesses = R.pipe(
    R.filter(p => !!p.name
            && !!p.pid
            && !!p.sessionName
            && !!p.sessionNumber
            && !!p.memoryUsage
    )
);

// Ramda is pretty fucking clean.
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
    )

    return pipeline(processes);
}

// For testing.
const pipeline = R.pipe(
    R.identity
);

const result = pipeline(getProcesses());
// console.log(result);

module.exports =
{
    getProcesses,
    PROCESS_KEY_NAMES
};

