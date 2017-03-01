'use strict';

const ReactDOM = require('react-dom');

/** All components except Dropdown are required and rendered here. */

/* eslint-disable no-unused-vars */
const Processes = require('./components/processes/Processes.js');
ReactDOM.render(<Processes/>, document.getElementById('processes'));
