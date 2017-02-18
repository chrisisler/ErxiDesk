'use strict';

const CP = require('child_process');

const defaultFunc = function(error, stdout, stderr)
{
    if (error)
    {
        console.error(`exec error: ${error}`);
        return;
    }
    else if (stdout)
    {
        console.log('stdout is:', stdout);
    }
    else if (stderr)
    {
        console.log('stderr is:', stderr);
    }
};

/**
 * Wrapper around CP.exec().
 * Given an array of process IDs attempt to kill all those processes.
 * @param {Array} processes - A list of process objects.
 * @param {Function} func - Callback - TODO: Am I going to use this??.
 */
function killProcesses(processes, func)
{
    const pids = processes.map(p => p.pid);

    let command = `taskkill`;

    pids.forEach(pid =>
    {
        command += ` /pid ${pid}`;
    });

    const options = { encoding: 'utf8' };

    console.warn('killProcesses.js -> Killing processes is not implemented. See README.md');
    // CP.exec(command, options, func || defaultFunc);
}

module.exports = killProcesses;

