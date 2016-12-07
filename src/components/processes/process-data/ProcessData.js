'use strict';

// Internal imports.
// const Util = require('../../../js/util.js');

// External imports.
const React = require('react');

class ProcessData extends React.Component
{
    constructor(props)
    {
        super(props);
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

