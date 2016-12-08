'use strict';

const React = require('react'),
      ReactDom = require('react-dom');

// All components from ./components/ are required and rendered here.
const Processes = require('./components/processes/Processes.js');

ReactDom.render(<Processes/>, document.getElementById('processes'));

