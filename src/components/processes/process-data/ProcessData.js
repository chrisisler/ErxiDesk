'use strict';

const { PROCESS_KEYS, convertMemoryUsageToNumber } = require('../getProcesses.js');
// const Dropdown = require('../../dropdown/Dropdown.js');

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

    handleRightClick(event)
    {
        // Reconstruct a <process> object from the clicked DOM node.
        let _process = {};

        event.target.parentNode.childNodes.forEach((childNode, index, array) =>
        {
            _process[PROCESS_KEYS[index]] = childNode.textContent;
        });

        // Convert memoryUsage and pid properties to integers.
        _process = convertMemoryUsageToNumber(_process, PROCESS_KEYS);
        // _process = Object.assign(_process, { [PROCESS_KEYS[1]]: Number.parseInt(_process[PROCESS_KEYS[1]]) });
    }

    render()
    {
        const self = this;
        return (
            <tr className='css-process-data'
                onContextMenu={self.handleRightClick.bind(self)}
            >
                <td>{this.props.name}</td>
                <td>{this.props.pid}</td>
                <td>{this.props.sessionName}</td>
                <td>{this.props.sessionNumber}</td>
                <td>{this._convertMemUseToString(this.props.memoryUsage)}</td>
            </tr>
        );
    }
}

module.exports = ProcessData;

