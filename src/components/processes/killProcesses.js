'use strict';

const CP = require('child_process');

/**
 * Wrapper around CP.exec().
 * Given a process ID, <pid>, attempt to kill that process.
 * @param {Number} pid - an ID of a <process> object.
 * @param {Function} func - Callback.
 */
function killProcess(pid, func)
{
    const command = `taskkill /pid ${pid}`;
    const options = { encoding: 'utf8' };

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

    CP.exec(command, options, func || defaultFunc);
}

module.exports = killProcess;

