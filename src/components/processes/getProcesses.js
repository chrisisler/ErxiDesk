/**
 * This file exports a list of the machine's currently running processes.
 * @see __getProcesses
 *
 * 1. Capture `tasklist` or `ps` output (depending on OS/platform).
 * 2. Pipe that output through functional pipeline, the "sanitizerFuncs".
 * 3. Export a single getProcesses() function.
 *
 * Note: Insert "R.tap(console.log)" to see the data at any point in the pipeline.
 */

'use strict';

const R = require('ramda');
const child_process = require('child_process');
const OS = require('os');
const q = require('q');

// Contains order and naming of keys of every `process` object, independent of OS/platform.
// Is used in functional pipelines ("sanitizerFuncs")
const PROCESS_KEYS = [ 'name', 'pid', 'memoryUsage' ];

const splitAtEOL = R.split(OS.EOL);

/**
 * Return a copy of the array with elements at the given indices swapped.
 * This func is used for non-Windows functional pipeline (because of `ps` column order).
 * @param {Number} x - The index of the first element to swap.
 * @param {Number} y - The index of the second element to swap.
 * @param {Array[*]} array - The array.
 * @return {Array[*]} - A new array with the elements swapped.
 */
const swapIndexes = R.curryN(3, (index1, index2, array) =>
{
    const element = array[index1];
    const arrayWithoutElement = R.without([ element ], array);
    return R.insert(index2, element, arrayWithoutElement);
});

/**
 * Apply <fn> to <prop> (of <obj>) and return the resulting object (which is a copy).
 * This func is the same as `prop => R.over(R.lensProp(prop))` (because of currying).
 * @example mapProp('id', Number, { id: '372', name: 'foo' }); //=> { id: 372, name: 'foo' }
 * @param {String} prop - Key of the given object.
 * @param {Function} fn - Applied to the value of the selected prop.
 * @param {Object} obj - Object to alter.
 * @returns {Object} - Returns the given object after calling <fn> on <prop>.
 */
const mapProp = R.curryN(3, (prop, fn, obj) => R.over(R.lensProp(prop), fn, obj));

/**
 * Return the given process object with its <memoryUsage> prop as a Number.
 * @example "12,032 K" -> 12032
 * @param {Object} - A process object with a <memoryUsage> property.
 * @returns {Object} - A process object with <memoryUsage> as a Number.
 */
const memUseToNum = mapProp('memoryUsage', R.pipe(
    R.dropLast(2),
    R.replace(',', ''),
    Number
));

/**
 * Not used in ./getProcess.js, only exported for external use.
 * @example 87108 -> '87,108 K'
 * @param {Object} - A processData object.
 * @returns {Object} - Object with memoryUsage prop as a String.
 */
const memUseToStr = mapProp('memoryUsage', R.pipe(
    R.unless(R.is(String), R.toString),
    R.reverse,
    R.splitEvery(3), R.flatten, R.join(','),
    R.reverse,
    R.concat(R.__, ' K')
));

/**
 * Return the given process object with its <pid> prop as a Number.
 * @param {Object} obj - A process obj.
 * @returns {Object} - A copy of the given object with <pid> prop as a Number
 */
const pidToNum = mapProp('pid', Number);

// Manipulatees the output from `tasklist` to a list of objects.
const windowsProcessOutputSanitizer = R.pipe(
    // Input: String - CRLF delimited.
    // Output Array[Object]
    splitAtEOL,
    R.map(
        R.pipe(
            // Input: '"foo", "bar"'
            // Output: [ 'foo', 'bar' ]
            str => JSON.parse(`[${str}]`),

            R.zipObj([ 'name', 'pid', 'sessionName', 'sessionNumber', 'memoryUsage' ]),

            // Convert PID prop of all objs from string to Number.
            pidToNum,

            // Only retain the props of the given obj that are included in PROCESS_KEYS.
            R.pick(PROCESS_KEYS)
        )
    ),
    // For some reasong, some objs have falsy memuse which throws an error. Remove those.
    R.filter(R.prop('memoryUsage')),

    // Convert memoryUsage prop to Number and remove ".exe" from name if applicable.
    R.map(
        R.pipe(
            memUseToNum,
            mapProp('name', R.when(
                R.test(/\.exe/i),
                R.dropLast(4)
            ))
        )
    )
);

/**
 * `ps` returns a string to be piped through the functions below.
 * @param {String} - The output of the `ps` command.
 * @returns {Array[Object]} - Array of process objects.
 */
const nonWindowsProcessOutputSanitizer = R.pipe(
    // Input: String - output from `ps` command.
    // Output: Array[String]
    splitAtEOL,
    R.map(
        R.pipe(
            R.trim,
            R.replace(/\s+/g, '--'),
            R.split('--'),

            // Rearrange element order to fit <PROCESS_KEYS> so we can use R.zipObj.
            swapIndexes(0, 2),
            swapIndexes(1, 2),

            // Input: Array[String] - Values of process objects
            // Output: Array[Object] - Process objects.
            R.zipObj(PROCESS_KEYS),

            // Convert PID and memoryUsage to Numbers
            pidToNum,
            memUseToNum
        )
    )
);

/**
 * Returns the currently running processes on this machine, async or sync
 * depending on the provided boolean flag.
 *
 * @private
 * @param {Boolean} doAsync - Whether to retrieve processes asynchronously or not.
 * @param {Object} windowsProcessOutputSanitizer - Contains functions that clean up `tasklist` output.
 * @param {Object} nonWindowsProcessOutputSanitizer - Contains funcs that clean up `ps` output.
 * @returns {Promise|Array[Object]} - Processes or a processes-returning promise.
 */
function __getProcesses(doAsync, windowsProcessOutputSanitizer, nonWindowsProcessOutputSanitizer)
{
    const isWindows = R.test(/^win/, process.platform);
    const command = isWindows ? 'tasklist /fo csv /nh' : 'ps -axco pid=,rss=,command=';
    const sanitize = isWindows ? windowsProcessOutputSanitizer : nonWindowsProcessOutputSanitizer;

    const options = { encoding: 'utf8' };

    return doAsync
        ? q.nfcall(child_process.exec, command, options).then(R.pipe(R.head, sanitize))
        : sanitize(child_process.execSync(command, options));
}

const getProcessesSync = () => __getProcesses(false, windowsProcessOutputSanitizer, nonWindowsProcessOutputSanitizer);
const getProcessesAsync = () => __getProcesses(true, windowsProcessOutputSanitizer, nonWindowsProcessOutputSanitizer);

module.exports =
{
    mapProp,
    getProcessesAsync,
    getProcessesSync,
    memUseToNum,
    memUseToStr,
    PROCESS_KEYS,
    pidToNum
};

