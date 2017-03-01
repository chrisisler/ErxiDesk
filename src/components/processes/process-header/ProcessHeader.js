'use strict';

const { PROCESS_KEYS } = require('../getProcesses.js');

const R = require('ramda');
const React = require('react');

class ProcessHeader extends React.Component
{
    constructor(props)
    {
        super(props);

        this.prettyTitles = [ 'Name', 'Process ID', 'Memory Usage' ];
        this.doReverseSort = true;
        this.cssClass = 'css-process-header';
    }

    /**
     * Private method that given a key of a <process>, returns a title (string).
     * @param {String} processKey
     * @returns {String} - Example: 'memoryUsage' -> 'Memory Usage'
     */
    getPrettyTitleFromKey(processKey)
    {
        // Dependent on ordering of <PROCESS_KEYS> found in getProcesses.js
        return this.prettyTitles[PROCESS_KEYS.indexOf(processKey)];
    }

    /**
     * Sorts <processes> based on which header title was clicked.
     * @param event - A (synthetic) JavaScript event.
     */
    handleLeftClick(event)
    {
        const processKeyToSortProcessesBy = event.target.id;

        if (!R.contains(processKeyToSortProcessesBy, PROCESS_KEYS))
        {
            throw new Error('processKeyToSortProcessesBy not contained in PROCESS_KEYS');
        }

        this.props.sortProcesses(
            processKeyToSortProcessesBy,
            this.doReverseSort
        );

        this.doReverseSort = !this.doReverseSort;
    }

    render()
    {
        return (
            <th className={this.cssClass}
                onClick={this.handleLeftClick.bind(this)}
                id={this.props.procKey}
            >
                {this.getPrettyTitleFromKey(this.props.procKey)}
            </th>
        );
    }
}

ProcessHeader.propTypes = {
    procKey: React.PropTypes.string,
    sortProcesses: React.PropTypes.func
};

ProcessHeader.defaultProps = {
    procKey: '',
    sortProcesses: function() {},
};

module.exports = ProcessHeader;

