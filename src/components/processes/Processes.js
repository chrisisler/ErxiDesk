'use strict';

// Internal imports.
const { getProcesses, PROCESS_KEYS } = require('./getProcesses.js');
const ProcessData = require('./process-data/ProcessData.js');

// External imports.
const React = require('react');

let processes = getProcesses();

// Each item in an array should have a unique <key> prop.

class Processes extends React.Component
{
    constructor()
    {
        super();
        this.state = { processes };
    }

    render()
    {
        return (
            <div className='container'>
                <table className='highlight centered'>

                    <thead className='css-process-header-wrap'>
                        <tr>
                            <th className='css-process-header-title'>Name</th>
                            <th className='css-process-header-title'>Process ID</th>
                            <th className='css-process-header-title'>Session Name</th>
                            <th className='css-process-header-title'>Session #</th>
                            <th className='css-process-header-title'>Memory Usage</th>
                        </tr>
                    </thead>

                    <tbody>
                        {this.state.processes.map(function(proc, index, array)
                        {
                            return <ProcessData
                                key={index}
                                name={proc.name}
                                pid={proc.pid}
                                sessionName={proc.sessionName}
                                sessionNumber={proc.sessionNumber}
                                memoryUsage={proc.memoryUsage}
                            />
                        })}
                    </tbody>

                </table>
            </div>
        );
    }
}

module.exports = Processes;

