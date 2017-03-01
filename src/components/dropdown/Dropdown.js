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

const R = require('ramda');
const React = require('react');
const ReactDOM = require('react-dom');

// For this.state.visibility -- it's CSS.
const on  = 'visible';
const off = 'hidden';

class Dropdown extends React.Component
{
    constructor(props)
    {
        super(props);

        this.cssClass = 'js-dropdown-menu';
        this.dividerClass = 'divider';

        this.state = {
            visibility: on,
            left: this.props.x,
            top: this.props.y
        };
    }

    /**
     * This function and makeActions are the two ways to create an `action` object for this dropdown.
     * Builds and returns an immutable `action` object to be part of this.props.actions.
     * @static
     * @param {String} text - Describes what will happen when this action is clicked.
     * @param {Array[Function]|Function} triggers - Fn or list of fns invoked when clicked.
     * @returns {Object} - An `action` object.
     */
    static newAction(text, triggers)
    {
        // <triggers> may be a function or an array containing one function.
        if (typeof triggers === typeof Function)
        {
            triggers = [ triggers ];
        }
        return { text, triggers };
    }

    /**
     * Create a divider for the dropdown menu.
     * @see this.renderActions and _Dropdown.scss
     * @static
     * @returns {Object} - A divider `action` object.
     */
    static makeDivider()
    {
        return Dropdown.newAction('divider', null);
    }

    componentDidMount()
    {
        this.avoidOverflow(this.state.left, this.state.top);

        const self = this;

        document.addEventListener('click', function(event)
        {
            const userClickedDropdown = R.any(R.equals(self.cssClass), [...event.target.classList.values]);

            if (!userClickedDropdown)
            {
                self.hideDropdown();
                document.removeEventListener('click', this);
            }
        });
    }

    // Given x, y (coordinates of the top-left corner of the dropdown menu),
    // attempts to keep the dropdown within window.innerWidth and window.innerHeight.
    avoidOverflow(x, y)
    {
        const windowWidth = window.innerWidth;
        const windowHeight = _getWindowHeight();

        const dropdown = ReactDOM.findDOMNode(this);
        const dropdownWidth = dropdown.offsetWidth;
        const dropdownHeight = dropdown.offsetHeight;

        const dropdownTotalX = dropdownWidth + x;
        const dropdownTotalY = dropdownHeight + y;

        if (dropdownTotalX > windowWidth) { x -= 250; }
        if (dropdownTotalY > windowHeight) { y -= dropdownHeight; }

        this.setState(Object.assign({}, this.state, {
            visibility: on,
            left: x,
            top: y
        }));
    }

    /**
     * This function is called whenever this component is rendered more than once.
     * This function updates state with an updated copy.
     * @param {Object} newProps - Updated properties.
     */
    componentWillReceiveProps(newProps)
    {
        this.setState({
            // visibility: on,
            left: newProps.x,
            top: newProps.y
        });

        this.avoidOverflow(newProps.x, newProps.y);
    }

    hideDropdown()
    {
        // this.setState({ visibility: off });
        ReactDOM.unmountComponentAtNode(document.getElementById('dropdown'));
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

    /**
     * Given an array of action objects (from this.newAction), map each of
     * them to an html <li/> element with an onClick listener set to the
     * action.invoke function property.
     * Also adds a divider (line) when action.text === 'divider'.
     * @param {Array[Object]} _actions - Array of action objects.
     * @returns {Array[<li/>]} - HTML <li/> elements.
     */
    renderActions(_actions)
    {
        return _actions.map((action, index, array) =>
        {
            if (action.text === this.dividerClass)
            {
                return <li key={index} className={`${this.cssClass} ${this.dividerClass}`}/>;
            }
            else
            {
                return (
                    <li
                        key={action.text}
                        onClick={this.handleClick.bind(this, action.triggers)}
                        className={this.cssClass}
                    >
                        {action.text}
                    </li>
                );
            }
        });
    }

    render()
    {
        return (
            <div
                className={`css-dropdown-wrap ${this.cssClass}`}
                style={this.state}
            >
                <ul>
                    {this.renderActions(this.props.actions)}
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

/**
 * Returns the current computer height for the entire HTML document.
 * @returns {Number} - HTML height.
 * @private
 */
function _getWindowHeight()
{
    const body = document.body,
          html = document.documentElement;

    return Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.scrollHeight,
        html.offsetHeight,
        html.clientHeight
    );
}

