'use strict';

// Internal imports.
const { getProcesses, PROCESS_KEYS } = require('./getProcesses.js');
const Process = require('./process/Process.js');

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

                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Process ID</th>
                            <th>Session Name</th>
                            <th>Session #</th>
                            <th>Memory Usage</th>
                        </tr>
                    </thead>

                    <tbody>
                        {this.state.processes.map(function(proc, index, array)
                        {
                            return <Process
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

