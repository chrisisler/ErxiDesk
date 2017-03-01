'use strict';

const React = require('react');

class SearchInput extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            value: ''
        };
    }

    onChange(event)
    {
        // If a validateInput function is given, use it.
        if (this.props.validateInput)
        {
            if (this.props.validateInput(event.target.value))
            {
                this.setState({ value: event.target.value });
                this.props.handleSearchQuery(event);
            }
        }
        else
        {
            this.setState({ value: event.target.value });
            this.props.handleSearchQuery(event);
        }
    }

    render()
    {
        return (
            <div>
                <form>
                    <input
                        type={'text' || this.props.type}
                        min={this.props.min}
                        max={this.props.max}
                        value={this.state.value}
                        onChange={this.onChange.bind(this)}
                        className={this.props.className}
                        placeholder={this.props.placeholder}
                    />
                </form>
            </div>
        );
    }
}

SearchInput.propTypes = {
    className:         React.PropTypes.string,
    handleSearchQuery: React.PropTypes.func
};

SearchInput.defaultProps = {
    className:         '',
    handleSearchQuery: function() {}
};

module.exports = SearchInput;

