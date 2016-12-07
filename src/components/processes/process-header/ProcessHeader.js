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

        this.state =
        {
            prettyTitles: [ 'Name', 'Process ID', 'Session Name', 'Session #', 'Memory Usage' ]
        };
    }

    _getPrettyTitleFromKey(processKey)
    {
        let prettyTitle;
        R.range(0, 5).forEach((index) =>
        {
            if (processKey === PROCESS_KEYS[index])
            {
                prettyTitle = this.state.prettyTitles[index];
            }
        });
        return prettyTitle;
    }

    render()
    {
        return (
            <th className='css-process-header-title'>
                {this._getPrettyTitleFromKey(this.props.title)}
            </th>
        );
    }
}

module.exports = ProcessHeader;

