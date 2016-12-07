'use strict';

// Internal imports.
// const Util = require('../../../js/util.js');

// External imports.
const React = require('react');

class ProcessData extends React.Component
{
    render()
    {
        return (
            <tr className='css-process-data'>
                <td><a>{this.props.name}</a></td>
                <td><a>{this.props.pid}</a></td>
                <td><a>{this.props.sessionName}</a></td>
                <td><a>{this.props.sessionNumber}</a></td>
                <td><a>{this.props.memoryUsage}</a></td>
            </tr>
        );
    }
}

module.exports = ProcessData;

