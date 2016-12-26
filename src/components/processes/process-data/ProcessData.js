'use strict';

const {
    PROCESS_KEYS,
    convertMemoryUsageToNumber,
    makeProcessObj
} = require('../getProcesses.js');
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
        const processRowNodes = event.target.parentNode.childNodes;
        const proc = makeProcessObj(processRowNodes, PROCESS_KEYS, elem => elem.textContent);
    }

    render()
    {
        const self = this;
        return (
            <tr className='css-process-data'
                onContextMenu={self.handleRightClick.bind(self)}>
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

