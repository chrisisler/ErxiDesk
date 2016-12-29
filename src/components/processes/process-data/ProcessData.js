'use strict';

const { PROCESS_KEYS, makeProcessObj } = require('../getProcesses.js');
const Dropdown = require('../../dropdown/Dropdown.js');
const Processes = require('../Processes.js');

const React = require('react'),
      ReactDOM = require('react-dom');
// const R = require('ramda');

class ProcessData extends React.Component
{
    constructor(props)
    {
        super(props);

        // props.processData.memoryUsage =
        //     props.processData.memoryUsage.toLocaleString() + ' K';
        // this.conv = memUse => memUse.toLocaleString() + ' K';
    }

    _convertMemUseToString(memUse)
    {
        return memUse.toLocaleString() + ' K';
    }

    onRightClick(event)
    {
        // Build a process, <proc>, from <event>.
        const procRowNodeList = event.target.parentNode.childNodes;
        const proc = makeProcessObj(procRowNodeList, PROCESS_KEYS, node => node.textContent);

        // Add a dropdown action object to kill the process with PID of <proc>.
        const killOneProcessText = `Kill "${proc.name}" (PID: ${proc.pid})`;
        const killOneProcessFunc = () => { console.log('killOneProcessFunc'); }
        const killOneProcessActionObj = Dropdown.makeNewActionObj(killOneProcessText, killOneProcessFunc);

        // Create <actions> list to be plugged into a Dropdown component.
        const actions = [ killOneProcessActionObj ];

        const allProcessesOfThisName = this.props.getProcessesOfThisName(proc.name);
        if (allProcessesOfThisName.length > 1)
        {
            const killAllProcsOfThisNameText =
                `Kill all ${allProcessesOfThisName.length} ${proc.name} processes`;
            const killAllProcsOfThisNameFunc = () => { console.log('killAllProcsOfThisNameFunc'); }
            const killAllProcsOfThisNameActionObj =
                Dropdown.makeNewActionObj(killAllProcsOfThisNameText, killAllProcsOfThisNameFunc);

            actions.push(killAllProcsOfThisNameActionObj)
        }

        const dropdownComponent = <Dropdown
            actions={actions}
            x={event.clientX}
            y={event.clientY}
        />;

        ReactDOM.render(dropdownComponent, document.getElementById('dropdown'));
    }

    render()
    {
        return (
            <tr className='css-process-data'
                onContextMenu={this.onRightClick.bind(this)}
            >
                <td>{this.props.processData.name}</td>
                <td>{this.props.processData.pid}</td>
                <td>{this.props.processData.sessionName}</td>
                <td>{this.props.processData.sessionNumber}</td>
                <td>{this._convertMemUseToString(this.props.processData.memoryUsage)}</td>
            </tr>
        );
    }
}

Dropdown.propTypes = {
    processData: React.PropTypes.object
};

Dropdown.defaultProps = {
    processData: {}
};

module.exports = ProcessData;

