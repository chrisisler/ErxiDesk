/**
 * This file exports a list of objects representing the
 * currently running processes on this machine.
 */

'use strict';

const R = require('ramda');
const CP = require('child_process');
const OS = require('os');

const getProcessesAsArrays = R.pipe(
    R.split(OS.EOL),
    R.map(process => JSON.parse('[' + process + ']'))
);

const getProcessesAsObjects = R.pipe(
    R.map(processAsArray =>
    {
        const processAsObject = {};
        processAsArray.forEach((processProp, index, array) =>
        {
            // Note that the indexes and keys are ordered the same as outputted
            // with the `tasklist` command on a Windows machine.
            if (index === 0) processAsObject['name'] = processProp;
            else if (index === 1) processAsObject['pid'] = processProp;
            else if (index === 2) processAsObject['sessionName'] = processProp;
            else if (index === 3) processAsObject['sessionNumber'] = processProp;
            else if (index === 4) processAsObject['memoryUsage'] = processProp;
        });
        return processAsObject;
    })
);

function getProcesses()
{
    // Get output from `tasklist` command as one big string.
    const processes = CP.execSync('tasklist /fo csv /nh', { encoding: 'utf8' });

    // Clean up the data and return.
    const processesAsArrays = getProcessesAsArrays(processes);
    const processesAsObjects = getProcessesAsObjects(processesAsArrays);
    return processesAsObjects;
}

module.exports =
{
    getProcesses: getProcesses
};

