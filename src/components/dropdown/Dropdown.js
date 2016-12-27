'use strict';

const React = require('react');

class Dropdown extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            display: 'block',
            left: props.x,
            top: props.y
        };
    }

    componentWillReceiveProps(newProps)
    {
        const updatedState = {
            left: newProps.x,
            top: newProps.y
        };
        this.setState(Object.assign({}, this.state, updatedState));
    }

    renderActions()
    {
        return this.props.actions.map(
            (action, index, array) => <li key={index}>{action}</li>
        );
    }

    render()
    {
        const self = this;

        return (
            <div className='css-dropdown-wrap' style={self.state}>
                <ul>
                    {self.renderActions()}
                </ul>
            </div>
        );
    }
}

module.exports = Dropdown;

