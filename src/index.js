'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

/** All components except Dropdown are required and rendered here. */

const Processes = require('./components/processes/Processes.js');
ReactDOM.render(<Processes/>, document.getElementById('processes'));
