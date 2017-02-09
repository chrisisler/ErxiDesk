/**
 * This file exports a list of the currently running processes.
 *
 * 1. Capture `tasklist` or `ps` output (depending on OS platform).
 * 2. Pipe that output through functional pipeline, the "sanitizers".
 * 3. Export a single getProcesses() function.
 * 4. Take over the world.
 *
 * For quick summary: @see __getProcesses
 */

'use strict';

const R = require('ramda');
const CP = require('child_process');
const OS = require('os');

// This is the order and names of the keys of the objects.
const PROCESS_KEYS = [ 'name', 'pid', 'memoryUsage' ];

/**
 * @example 'Hello\nWorld' -> [ 'Hello', 'World' ]
 * @returns {Array[String]}
 * @private
 */
const _splitAtEndOfLine = R.split(OS.EOL);

/**
 * Return a copy of the array with elements at the given indices swapped.
 * This func is used for non-Windows functional pipeline.
 * @param {Number} x - The index of the first element to swap.
 * @param {Number} y - The index of the second element to swap.
 * @param {Array[*]} array - The array.
 * @return {Array[*]} - A new array with the elements swapped.
 * @private
 */
const _swapIndex = R.curry((x, y, array) =>
{
    if (array.length === 1) return array;

    const arr = array.slice(0); // Clone the array

    const pluckedElement = arr.splice(x, 1, arr[y])[0];

    arr.splice(y, 1, pluckedElement); // Put <pluckedElement> back into <arr>.

    return arr;
});

/**
 * @see R.over
 * @see R.lensProp
 * @param {String} prop - Name of a property of an object to convert to Number;
 * @param {Function} fn - A function invoked with the given <prop> as the arg.
 * @returns {Function} - A func which, when invoked with an object as an
 *     argument, returns the given object, with <prop> as a Number.
 */
const alterProp = R.curry((prop, fn) => R.over(R.lensProp(prop), fn));

/**
 * Return the given process object with its <memoryUsage> prop as a Number.
 * This func is used for Windows functional pipeline.
 * @example "12,032 K" -> 12032.
 * @param {Object} - A process object with a <memoryUsage> property.
 * @returns {Object} - A process object with <memoryUsage> as a Number.
 * @see alterProp
 */
const memoryUsageToNumber = alterProp('memoryUsage', R.pipe(
    R.dropLast(2),
    R.replace(',', ''),
    parseInt
));

/**
 * Creates a new object from a list of keys and a list of values by applying
 * the given function to each equally-positioned pair in the lists (key first).
 * Key/value pairing is truncated to the length of the shorter list.
 * @see R.zipWith
 * @see R.fromPairs @example [['a', 1], ['b', 2]] -> { a: 1, b: 2 }
 * @param {Function} fn - Input: [ keyN, valN ] Output: [ key, val ]
 * @param {Array[*]} keys - Array whose elements will be the keys.
 * @param {Array[*]} vals - Array whose elements will be the values.
 * @returns {Object} - The obj made by combining same-index elements using <fn>.
 */
const zipObjBy = R.curry((fn, keys, vals) => {
    const customZipFunc = R.pipe(R.pair, fn);
    const arrayOfKeyValuePairs = R.zipWith(customZipFunc, keys, vals);
    const obj = R.fromPairs(arrayOfKeyValuePairs);
    return obj;
});

/**
 * A namespace for Windows sanitizerFuncs which act as a pipeline
 * to manipulate the data retrieved from `tasklist`.
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

                // (['key1', 'key2'], ['val1', 'val2']) -> { key1: val1, key2: val2 }
                R.zipObj([ 'name', 'pid', 'sessionName', 'sessionNumber', 'memoryUsage' ])
            )
        )
    ),

    /**
     * Converts PID prop of all objs from string to Number.
     * @param {Array[Object]}
     * @returns {Array[Object]}
     */
    convertPIDsToNumbers: R.map(alterProp('pid', parseInt)),

    /**
     * Removes the sessionName and sessionNumber props from objects.
     * @param {Array[Object]}
     * @returns {Array[Object]}
     */
    removeSessionNameAndSessionNumberProps: R.map(
        R.pipe(
            R.dissoc('sessionName'),
            R.dissoc('sessionNumber')
        )
    ),

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
        alterProp('name',
            R.when(R.test(/\.exe/i), R.dropLast(4))
        )
    )
};

/**
 * The execSync(`ps`) command returns a string which is piped through all
 * the functions below, in order.
 *
 * Insert "R.tap(console.log)" to see the data at any point in the pipeline.
 *
 * @param {String} - dirtyProcesses: The output of the `ps` command.
 * @returns {Array[Object]} - cleanProcesses: Array of process objects.
 * @private
 */
const macOSSanitizerFuncs = {

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

    // Rearrange element order to fit <PROCESS_KEYS>.
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
    zipArrayWithKeysToObj: R.map(
        R.zipObj(PROCESS_KEYS)
    ),

    convertPIDAndMemoryUsageToNumber: R.map(
        R.pipe(
            alterProp('pid', parseInt),
            alterProp('memoryUsage', parseInt)
        )
    )
};

/**
 * This is the private version of <getProcesses> which does the same thing,
 * except specifies in its arguments that it reaches out to access both
 * <windowsSanitizerFuncs> and <macOSSanitizerFuncs> to be a pure function.
 * @param {Object} windowsSanitizerFuncs - Namespace for Windows pipeline.
 * @param {Object} macOSSanitizerFuncs - Namespace for non-Windows pipeline.
 * @returns {Function} which returns {Array[Object]} - The currently running processes.
 * @private
 */
function __getProcesses(windowsSanitizerFuncs, macOSSanitizerFuncs)
{
    const isWindows = R.test(/^win/, process.platform);

    const command = isWindows ? 'tasklist /fo csv /nh' : 'ps -axco pid=,rss=,command=';
    const sanitizerFuncs = isWindows ? windowsSanitizerFuncs : macOSSanitizerFuncs;

    const dirtyProcesses = CP.execSync(command, { encoding: 'utf8' });

    // This does a couple things:
    // 1. Makes it so that the values of <sanitizerFuncs> are platform-independent.
    // 2. Allows us to add/remove functions without needed to be hard-coded here.
    // 3. Uses spread syntax.
    const clean = R.pipe(...R.values(sanitizerFuncs));

    const cleanProcesses = clean(dirtyProcesses);
    return () => cleanProcesses;
}

// The same as __getProcesses except it doesn't require the arguments.
const getProcesses = __getProcesses(windowsSanitizerFuncs, macOSSanitizerFuncs);

// const result = getProcesses();
// console.log(result);

module.exports = {
    getProcesses,
    PROCESS_KEYS,
    zipObjBy,
    memoryUsageToNumber
};

