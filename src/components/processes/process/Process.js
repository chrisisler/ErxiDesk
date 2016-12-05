'use strict';

// Internal imports.
// const Util = require('../../../js/util.js');

// External imports.
const React = require('react');

class Process extends React.Component
{
    render()
    {
        return (
            <tr>
                <td><a>{this.props.name}</a></td>
                <td><a>{this.props.pid}</a></td>
                <td><a>{this.props.sessionName}</a></td>
                <td><a>{this.props.sessionNumber}</a></td>
                <td><a>{this.props.memoryUsage}</a></td>
            </tr>
        );
    }
}

module.exports = Process;

