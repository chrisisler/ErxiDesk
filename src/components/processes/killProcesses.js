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
 * @param {Array[Number]} pids - IDs of a <process> object.
 * @param {Function} func - Callback - TODO: Am I going to use this??.
 */
function killProcesses(pids, func)
{
    let command = `taskkill`;

    pids.forEach(pid =>
    {
        command += ` /pid ${pid}`;
    });

    const options = { encoding: 'utf8' };

    console.log('command is:', command);
    // CP.exec(command, options, func || defaultFunc);
}

module.exports = killProcesses;

