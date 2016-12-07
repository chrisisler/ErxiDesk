'use strict';

// Internal imports.
const { getProcesses, PROCESS_KEYS } = require('./getProcesses.js');
const ProcessData = require('./process-data/ProcessData.js');
const ProcessHeader = require('./process-header/ProcessHeader.js');

// External imports.
const React = require('react');

class Processes extends React.Component
{
    constructor(props)
    {
        super(props);

        // If you do not use <state.foo> in render, it should not be on the state.
        this.state =
        {
            processes: getProcesses()
        };
    }

    render()
    {
        return (
            <div className='container'>
                <table className='highlight centered css-process-wrap'>

                    <thead className='css-process-header-wrap'>
                        <tr>
                            {PROCESS_KEYS.map(function(procKey, index, array)
                            {
                                return <ProcessHeader key={index} title={procKey} />
                            })}
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

