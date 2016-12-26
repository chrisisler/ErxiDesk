'use strict';

const React = require('react');

class Dropdown extends React.Component
{
    constructor(props)
    {
        super(props);
    }

    render()
    {
        return (
            <ul className='css-dropdown'>
                <li><a>Option 1</a></li>
                <li><a>Option 2</a></li>
                <li><a>Option 3</a></li>
            </ul>
        );
    }
}

module.exports = Dropdown;
