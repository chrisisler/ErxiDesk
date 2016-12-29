'use strict';

const { PROCESS_KEYS } = require('../getProcesses.js');

const React = require('react');

class ProcessHeader extends React.Component
{
    constructor(props)
    {
        super(props);

        this.doReverseSort = false;

        this.prettyTitles = [
            'Name',
            'Process ID',
            'Session Name',
            'Session #',
            'Memory Usage'
        ];
    }

    /**
     * Private method that given a key of a <process>, returns a title (string).
     * @returns prettyTitle - Example: memoryUsage -> Memory Usage
     * @private
     */
    _getPrettyTitleFromKey(processKey)
    {
        return this.prettyTitles[PROCESS_KEYS.indexOf(processKey)];
    }

    /**
     * Sorts <processes> based on which header title was clicked.
     * @param event - A (synthetic) JavaScript event.
     */
    handleLeftClick(event)
    {
        const processKeyToSortProcessesBy = event.target.id;

        this.props.sortProcesses(
            processKeyToSortProcessesBy,
            this.doReverseSort
        );

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

ProcessHeader.propTypes = {
    procKey: React.PropTypes.string,
    sortProcesses: React.PropTypes.func,
};

ProcessHeader.defaultProps = {
    procKey: '',
    sortProcesses: function() {},
};

module.exports = ProcessHeader;

