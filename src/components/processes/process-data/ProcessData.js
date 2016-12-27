'use strict';

const { PROCESS_KEYS, makeProcessObj } = require('../getProcesses.js');
const Dropdown = require('../../dropdown/Dropdown.js');

const React = require('react'),
      ReactDOM = require('react-dom');
const R = require('ramda');

class ProcessData extends React.Component
{
    constructor(props)
    {
        super(props);

        props.processData.memoryUsage =
            props.processData.memoryUsage.toLocaleString() + ' K';
    }

    _convertMemUseToString(memUse)
    {
        return memUse.toLocaleString() + ' K';
    }

    onRightClick(event)
    {
        const procNodeList = event.target.parentNode.childNodes;
        const proc = makeProcessObj(procNodeList, PROCESS_KEYS, node => node.textContent);
        const mockActions = R.values(proc);
        const dropdownComponent = <Dropdown actions={mockActions} x={event.clientX} y={event.clientY} />;

        ReactDOM.render(dropdownComponent, document.getElementById('dropdown'));
    }

    renderProcessData()
    {
        let index = 1;
        return R.pipe(
            R.values,
            R.map(procDataValue => <td key={index++}>{procDataValue}</td>)
        )(this.props.processData);
    }

    render()
    {
        return (
            <tr className='css-process-data'
                onContextMenu={this.onRightClick.bind(this)} >
                {this.renderProcessData()}
            </tr>
        );
    }
}

module.exports = ProcessData;

