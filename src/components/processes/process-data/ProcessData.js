'use strict';

// Internal imports.
const { PROCESS_KEYS } = require('../getProcesses.js');
const Dropdown = require('../../dropdown/Dropdown.js');

// External imports.
const React = require('react');
const R = require('ramda');
const $ = require('jquery');

class ProcessData extends React.Component
{
    constructor(props)
    {
        super(props);
        this.dropdownString = 'js-process-data';
    }

    _convertMemUseToString(memUse)
    {
        return memUse.toLocaleString() + ' K';
    }

    handleRightClick(event)
    {
        // Reconstruct a <process> object from the clicked DOM node.
        const processAsDomNode = event.target.parentNode;
        let _process = {};

        processAsDomNode.childNodes.forEach((childNode, index, array) =>
        {
            _process[PROCESS_KEYS[index]] = childNode.textContent;
        });
        // $(processAsDomNode.childNodes[0]).dropdown('open');
        // console.log(processAsDomNode.childNodes[0]);
    }

    render()
    {
        const self = this;
        return (
            <tr className='css-process-data'
                onContextMenu={self.handleRightClick.bind(self)}
            >
                <td>
                    <a className='dropdown-button' data-activates={this.dropdownString}>
                        {this.props.name}
                    </a>
                </td>
                <td>
                    <a className='dropdown-button' data-activates={this.dropdownString}>
                        {this.props.pid}
                    </a>
                </td>
                <td>
                    <a className='dropdown-button' data-activates={this.dropdownString}>
                        {this.props.sessionName}
                    </a>
                </td>
                <td>
                    <a className='dropdown-button' data-activates={this.dropdownString}>
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

