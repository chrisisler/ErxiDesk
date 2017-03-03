'use strict';

const q = require('q');

/**
 * Kill (or send <signal> to) every process in the given list.
 * @param {Array[Object]} procs - List of processes.
 * @param {String} signal - Like 'SIGTERM', or similar.
 * @returns {Promise}
 */
module.exports = function killProcesses(procs, signal)
{
    return q().then(() =>
    {
        try
        {
            procs.forEach(proc =>
            {
                process.kill(proc.pid, signal || 'SIGTERM');
            });
        }
        catch (error)
        {
            if (error.code !== 'ESRCH')
            {
                throw error;
            }
        }
    });
};
