'use strict';

/* eslint-disable */

const child_process = require('child_process');

// const defaultFunc = function(error, stdout, stderr)
// {
//     if (error)
//     {
//         console.error(`exec error: ${error}`);
//     }
//     else if (stdout)
//     {
//         console.log('stdout is:', stdout);
//     }
//     else if (stderr)
//     {
//         console.log('stderr is:', stderr);
//     }
// };

/**
 * Wrapper around CP.exec().
 * Given an array of process IDs attempt to kill all those processes.
 * @param {Array} processes - A list of process objects.
 * @param {Function} func - Callback - TODO: Am I going to use this??.
 */
function killProcesses(procs, fn)
{
    const pids = R.pluck('pid', procs);

    // TODO: Do in one line with functions (reduce?).
    let command = `taskkill`;
    pids.forEach(pid => { command += ` /pid ${pid}`; });

    const options = { encoding: 'utf8' };

    // return q.nfcall(child_process.exec, command, options, fn);
}

module.exports = killProcesses;

