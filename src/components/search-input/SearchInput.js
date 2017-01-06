'use strict';

const React = require('react'),
      ReactDOM = require('react-dom');

class SearchInput extends React.Component
{
    constructor(props)
    {
        super(props);

        this.placeholderText = 'Search';

        this.state = { value: '' };
    }

    onChange(event)
    {
        this.setState({ value: event.target.value });
        this.props.handleSearchQuery(event);
    }

    render()
    {
        return (
            <div>
                <form>
                    <input
                        type='text'
                        value={this.state.value}
                        className={this.props.className}
                        onChange={this.onChange.bind(this)}
                        placeholder={this.placeholderText}
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

