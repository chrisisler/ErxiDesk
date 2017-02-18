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
const CP = require('child_process');
const OS = require('os');

// Contains order and naming of keys of every `process` object, independent of OS/platform.
// Is used in functional pipelines ("sanitizerFuncs")
const PROCESS_KEYS = [ 'name', 'pid', 'memoryUsage' ];

/** @private */
const _splitAtEndOfLine = R.split(OS.EOL);

/**
 * Return a copy of the array with elements at the given indices swapped.
 * This func is used for non-Windows functional pipeline (because of `ps` column order).
 * @param {Number} x - The index of the first element to swap.
 * @param {Number} y - The index of the second element to swap.
 * @param {Array[*]} array - The array.
 * @return {Array[*]} - A new array with the elements swapped.
 * @private
 */
const _swapIndex = R.curryN(3, (index1, index2, array) => {
    const element = array[index1];
    const arrayWithoutElement = R.without([ element ], array);
    return R.insert(index2, element, arrayWithoutElement);
});

/**
 * Apply <fn> to <prop> (of <obj>) and return the resulting object (which is a copy).
 * This func is the same as `prop => R.over(R.lensProp(prop))` (because of currying).
 * @see R.over @see R.lensProp
 * @param {String} prop - Key of the given object.
 * @param {Function} fn - Applied to the value of the selected prop.
 * @param {Object} obj - Object to alter.
 * @returns {Object} - Returns the given object after calling <fn> on <prop>.
 */
const mapProp = R.curryN(3, (prop, fn, obj) => R.over(R.lensProp(prop), fn, obj));

/**
 * Return the given process object with its <memoryUsage> prop as a Number.
 * @see mapProp
 * @example "12,032 K" -> 12032
 * @param {Object} - A process object with a <memoryUsage> property.
 * @returns {Object} - A process object with <memoryUsage> as a Number.
 */
const memoryUsageToNumber = mapProp('memoryUsage', R.pipe(
    R.dropLast(2),
    R.replace(',', ''),
    parseInt
));

/**
 * Creates a new object from a list of keys and a list of values by applying
 * the given function to each equally-positioned pair in the lists (key first).
 * Key/value pairing is truncated to the length of the shorter list.
 * @see R.zipWith @see R.fromPairs
 * @param {Function} fn - Input: [ keyN, valN ] Output: [ key, val ]
 * @param {Array[*]} keys - Array whose elements will be the keys.
 * @param {Array[*]} vals - Array whose elements will be the values.
 * @returns {Object} - The obj made by combining same-index elements using <fn>.
 */
// const zipObjBy = R.curryN(3, (fn, keys, vals) => {
//     const customZipFunc = R.pipe(R.pair, fn);
//     const arrayOfKeyValuePairs = R.zipWith(customZipFunc, keys, vals);
//     const obj = R.fromPairs(arrayOfKeyValuePairs);
//     return obj;
// });

/**
 * A namespace for Windows sanitizer functions which act as a pipeline
 * which manipulates the output from `tasklist` to an array of objects.
 * Functions are invoked one at a time, in the order seen below.
 */
const windowsSanitizerFuncs = {

    /**
     * @see R.zipObj
     * @param {String} - CRLF delimited string.
     * @returns {Array[Object]}
     */
    convertTasklistOutputToArrayOfObjects: R.pipe(
        _splitAtEndOfLine,
        R.map(
            R.pipe(
                // '"foo", "bar"' -> [ 'foo', 'bar' ]
                str => JSON.parse(`[${str}]`),

                // R.zipObj(['k1', 'k2'], ['v1', 'v2']) -> { k1: v1, k2: v2 }
                R.zipObj([ 'name', 'pid', 'sessionName', 'sessionNumber', 'memoryUsage' ])
            )
        )
    ),

    /**
     * Converts PID prop of all objs from string to Number.
     * @param {Array[Object]}
     * @returns {Array[Object]}
     */
    convertPIDsToNumbers: R.map(mapProp('pid', Number)),

    /**
     * Removes the sessionName and sessionNumber props from objects.
     * @param {Array[Object]}
     * @returns {Array[Object]}
     */
    removeSessionNameAndSessionNumberProps: R.map(R.pick(PROCESS_KEYS)),

    /**
     * For some reason, some proc objects have undefined memoryUsage.
     * Remove those objs whose memoryUsage prop is falsy.
     * @param {Array[Object]}
     * @returns {Array[Object]}
     */
    filterProcessesWithFalsyMemoryUse: R.filter(R.prop('memoryUsage')),

    /**
     * Maps a memoryUsage prop to Number.
     * @example "12,032 K" -> 12032.
     * @param {Array[Object]}
     * @returns {Array[Object]}
     */
    mapMemoryUsageToNumber: R.map(memoryUsageToNumber),

    /**
     * @example "chrome.exe" -> "chrome"
     * @example "something" -> "something"
     * @param {Array[Object]}
     * @returns {Array[Object]}
     */
    filterExeFromName: R.map(
        mapProp('name', R.when(
            R.test(/\.exe/i),
            R.dropLast(4)
        ))
    )
};

/**
 * `ps` returns a string to be piped through the functions below, in order.
 *
 *
 * @param {String} - dirtyProcesses: The output of the `ps` command.
 * @returns {Array[Object]} - cleanProcesses: Array of process objects.
 * @private
 */
const nonWindowsSanitizerFuncs = {

    /**
     * @param {String} - Output from `ps` (on non-Windows box).
     * @returns {Array[String]}
     */
    convertPSOutputToArray: R.pipe(
        _splitAtEndOfLine,
        R.map(
            R.pipe(
                R.trim,
                R.replace(/\s+/g, '--'),
                R.split('--')
            )
        )
    ),

    // Rearrange element order to fit <PROCESS_KEYS> so we can use R.zipObj.
    permuteIndexes: R.map(
        R.pipe(
            _swapIndex(0, 2),
            _swapIndex(1, 2)
        )
    ),

    /**
     * TODO: Write a better name for this key.
     * @see R.zipObj
     * @param {Array[String]}
     * @returns {Array[Object]}
     */
    zipArrayWithKeysToObj: R.map(R.zipObj(PROCESS_KEYS)),

    convertPIDAndMemoryUsageToNumber: R.map(
        R.pipe(
            mapProp('pid', parseInt),
            mapProp('memoryUsage', parseInt)
        )
    )
};

/**
 * This is the private version of <getProcesses> which does the same thing,
 * except specifies in its arguments that it reaches out to access both
 * <windowsSanitizerFuncs> and <nonWindowsSanitizerFuncs> to be a pure function.
 * @param {Object} windowsSanitizerFuncs - Namespace for Windows pipeline.
 * @param {Object} nonWindowsSanitizerFuncs - Namespace for non-Windows pipeline.
 * @returns {Function} which returns {Array[Object]} - The currently running processes.
 * @private
 */
function __getProcesses(windowsSanitizerFuncs, nonWindowsSanitizerFuncs)
{
    const isWindows = R.test(/^win/, process.platform);

    const command = isWindows ? 'tasklist /fo csv /nh' : 'ps -axco pid=,rss=,command=';
    const sanitizerFuncs = isWindows ? windowsSanitizerFuncs : nonWindowsSanitizerFuncs;

    const dirtyProcesses = CP.execSync(command, { encoding: 'utf8' });

    // This does a couple things:
    // 1. Makes it so that the values of <sanitizerFuncs> are platform-independent.
    // 2. Allows us to add/remove functions without needed to be hard-coded here.
    // 3. Uses spread syntax.
    const clean = R.pipe(...R.values(sanitizerFuncs));

    const cleanProcesses = clean(dirtyProcesses);

    return function() {
        return cleanProcesses
    };
}

// The same as __getProcesses except it doesn't require the arguments.
const getProcesses = __getProcesses(windowsSanitizerFuncs, nonWindowsSanitizerFuncs);

// const procs = getProcesses();
// const fn = R.pipe(
//     R.identity
// );
// console.log(fn(procs));

module.exports = {
    mapProp,
    getProcesses,
    memoryUsageToNumber,
    PROCESS_KEYS
};

