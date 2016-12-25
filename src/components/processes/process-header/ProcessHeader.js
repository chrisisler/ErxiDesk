'use strict';

// Internal imports.
const { PROCESS_KEYS } = require('../getProcesses.js');

// External imports.
const React = require('react');

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
        [0, 1, 2, 3, 4].forEach((index) =>
        {
            if (processKey === PROCESS_KEYS[index])
            {
                prettyTitle = this.prettyTitles[index];
            }
        });
        return prettyTitle;
    }

    /**
     * Sorts <processes> based on which header title was clicked.
     * @param event - A synthetic JavaScript event.
     */
    handleLeftClick(event)
    {
        const keyToSortBy = event.target.id;

        this.props.sort(keyToSortBy, this.props.processes, this.doReverseSort);

        this.doReverseSort = !this.doReverseSort;
    }

    render()
    {
        return (
            <th className='css-process-header'
                onClick={this.handleLeftClick.bind(this)}
                id={this.props.procKey}
            >
                {this._getPrettyTitleFromKey(this.props.procKey)}
            </th>
        );
    }
}

module.exports = ProcessHeader;

