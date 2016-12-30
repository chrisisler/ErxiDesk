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
 *         x={event.pageX}
 *         y={event.pageY}
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
            left: this.props.x,
            top: this.props.y
        };
    }

    /**
     * Builds an `action` object to be part of this.actions.
     * This function is used to build action object to be placed in
     * this.props.actions. (That can't be done internally because of `this` context.)
     * @param {String} text - Describes what will happen when this action is clicked.
     * @param {Array[Function]|Function} triggers - Function or list of functions to
     *     invoke when this action is clicked.
     * @returns {Object} - An `action` object.
     * @static
     */
    static makeNewActionObj(text, triggers)
    {
        if (typeof triggers === typeof Function)
        {
            triggers = [ triggers ];
        }
        return Object.assign(Object.create(null), { text, triggers });
    }

    /**
     * Uses Dropdown.makeNewActionObj to add an action to <actions>
     * @param {Array[Object]} actions - List of actions for use as this.props.actions.
     * @param {String} text - Describes what will happen when this action is clicked.
     * @param {Array[Function]|Function} triggers - Function or list of functions to
     *     invoke when this action is clicked.
     * @returns {Array[Object]} - A copy of <actions> with <newAction> pushed.
     * @static
     */
    static addAction(actions, text, triggers)
    {
        let actionsClone = actions.slice(0);
        const newAction = Dropdown.makeNewActionObj(text, triggers);

        actionsClone.push(newAction);
        return actionsClone;
    }

    componentDidMount()
    {
        const self = this;

        document.addEventListener('click', function(event)
        {
            const eventDidOccurInDropdown = [...event.target.classList.values]
                .some(_class => _class === self.dropdownClass);

            if (!eventDidOccurInDropdown)
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

    /**
     * Hides dropdown and invokes all trigger functions in the given list of functions.
     * @param {Array[Function]} triggers - A list of functions to invoke.
     */
    handleClick(triggers)
    {
        this.hideDropdown();
        triggers.forEach(trigger => {
            trigger();
        });
    }

    renderActions()
    {
        return this.props.actions.map((action, index, array) =>
            <li
                key={index}
                onClick={this.handleClick.bind(this, action.triggers)}
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

