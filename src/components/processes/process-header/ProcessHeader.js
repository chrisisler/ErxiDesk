'use strict';

// Internal imports.
const { PROCESS_KEYS } = require('../getProcesses.js');

// External imports.
const React = require('react');
const R = require('ramda');

class ProcessHeader extends React.Component
{
    constructor(props)
    {
        super(props);

        this.doReverseSort = false;
        this.prettyTitles = [ 'Name', 'Process ID', 'Session Name', 'Session #', 'Memory Usage' ];
    }

    /**
     * Private method that given a key of a <process>, returns a title (string).
     * @returns prettyTitle - Example: memoryUsage -> Memory Usage
     * @private
     */
    _getPrettyTitleFromKey(processKey)
    {
        let prettyTitle;
        R.range(0, 5).forEach((index) =>
        {
            if (processKey === PROCESS_KEYS[index])
            {
                prettyTitle = this.prettyTitles[index];
            }
        });
        return prettyTitle;
    }

    /**
     * Handles left-click sorting of process data based on clicked header.
     * @param event - A synthetic JavaScript event.
     */
    handleClick(event)
    {
        const keyToSortBy = event.target.id;

        this.props.sort(keyToSortBy, this.props.processes, this.doReverseSort);

        this.doReverseSort = !this.doReverseSort;
    }

    render()
    {
        return (
            <th
                className='css-process-header-title'
                onClick={this.handleClick.bind(this)}
                id={this.props.procKey}
            >
                {this._getPrettyTitleFromKey(this.props.procKey)}
            </th>
        );
    }
}

module.exports = ProcessHeader;

