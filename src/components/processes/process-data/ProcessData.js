'use strict';

// Internal imports.
const R = require('ramda');

// External imports.
const React = require('react');

class ProcessData extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            processDataValues:
            [
                this.props.name,
                this.props.pid,
                this.props.sessionName,
                this.props.sessionNumber,
                this._convertMemUseToString(this.props.memoryUsage)
            ]
        };
    }

    _convertMemUseToString(memUse)
    {
        return memUse.toLocaleString() + ' K';
    }

    render()
    {
        return (
            <tr className='css-process-data'>
                <td>
                    <a className='dropdown-button' data-activates='js-process-data'>
                        {this.props.name}
                    </a>
                </td>
                <td>
                    <a className='dropdown-button' data-activates='js-process-data'>
                        {this.props.pid}
                    </a>
                </td>
                <td>
                    <a className='dropdown-button' data-activates='js-process-data'>
                        {this.props.sessionName}
                    </a>
                </td>
                <td>
                    <a className='dropdown-button' data-activates='js-process-data'>
                        {this.props.sessionNumber}
                    </a>
                </td>
                <td>
                    <a className='dropdown-button' data-activates='js-process-data'>
                        {this._convertMemUseToString(this.props.memoryUsage)}
                    </a>
                </td>
            </tr>
        );
    }
}

module.exports = ProcessData;

