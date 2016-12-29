/**
 * This dropdown component (sometimes called a "context menu") gets its options/actions
 * from this.props.actions (an array of objects). Each "action" object is a text
 * string that the end user can click, which will fire the given "invoke" property,
 * a function.
 *
 * The user of this component builds an array of actions and injects that array as a prop.
 *
 * @example
 *     
 *     const newDropdownComponentInstance = <Dropdown
 *         actions={[
 *             {
 *                 text: 'Say Hello',
 *                 invoke: function() { console.log('Hello'); }
 *             },
 *             {
 *                 text: 'whatever',
 *                 invoke: functionWhichDoesCoolThings
 *             }
 *         ]}
 *         x={event.clientX}
 *         y={event.clientY}
 *     />;
 */

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

    /**
     * This function is used externally to build action object to be placed in
     * this.props.actions. (That can't be done internally because of `this` context.)
     * @param {String} text - Describes to the end user what will happen when
     * this action is clicked.
     * @param {Function} invoke - The function that will be fired when this action
     * is clicked.
     * @returns {Object} - An object with properties "text" and "invoke".
     */
    static makeNewActionObj(text, invoke)
    {
        return { text, invoke };
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

    /**
     * This function is called whenever this component is rendered more than once.
     * This function updates state with an updated copy.
     * @param {Object} newProps - Updated properties.
     */
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

