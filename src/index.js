'use strict';

const React = require('react'),
      ReactDOM = require('react-dom');

/** All components from ./components/ are required and rendered here. */

const Processes = require('./components/processes/Processes.js');
ReactDOM.render(<Processes/>, document.getElementById('processes'));

// const Dropdown = require('./components/dropdown/Dropdown.js');
// ReactDOM.render(<Dropdown/>, document.getElementById('dropdown'));

