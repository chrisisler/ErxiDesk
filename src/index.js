'use strict';

const React = require('react'),
      ReactDom = require('react-dom');

// All components from ./components/ are required and rendered here.
const Processes = require('./components/processes/Processes.js');
const Dropdown = require('./components/dropdown/Dropdown.js');

ReactDom.render(<Processes/>, document.getElementById('processes'));
ReactDom.render(<Dropdown/>, document.getElementById('dropdown'));

