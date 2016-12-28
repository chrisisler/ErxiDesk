'use strict';

const React = require('react');

class Dropdown extends React.Component
{
    constructor(props)
    {
        super(props);

        this.hideDropdown.bind(this);

        this.dropdownClass = 'dropdown-menu';

        this.state = {
            display: 'block',
            left: props.x,
            top: props.y
        };
    }

    componentDidMount()
    {
        const self = this;

        document.addEventListener('click', function(event)
        {
            const eventOccurredWithinDropdown = [...event.target.classList.values]
                .some(_class => _class === self.dropdownClass);

            if (!eventOccurredWithinDropdown)
            {
                self.hideDropdown();
                document.removeEventListener('click', this);
            }
        });
    }

    componentWillReceiveProps(newProps)
    {
        this.setState((previousState, previousProps) =>
            Object.assign({}, previousState, {
                display: 'block',
                left: newProps.x,
                top: newProps.y
            })
        );
    }

    hideDropdown()
    {
        this.setState(Object.assign({}, this.state, { display: 'none' }));
    }

    handleClick(func)
    {
        this.hideDropdown();
        func();
    }

    renderActions()
    {
        return this.props.actions.map((action, index, array) =>
            <li
                key={index}
                onClick={this.handleClick.bind(this, action.invoke)}
                className={this.dropdownClass}
            >
                {action.text}
            </li>
        );
    }

    render()
    {
        const self = this;

        return (
            <div className={`css-dropdown-wrap ${self.dropdownClass}`} style={self.state}>
                <ul>
                    {self.renderActions()}
                </ul>
            </div>
        );
    }
}

Dropdown.propTypes = {
    actions: React.PropTypes.array,
    x: React.PropTypes.number,
    y: React.PropTypes.number
};

Dropdown.defaultProps = {
    actions: [],
    x: 0,
    y: 0
};

module.exports = Dropdown;

