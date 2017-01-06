'use strict';

const React = require('react'),
      ReactDOM = require('react-dom');

class SearchInput extends React.Component
{
    constructor(props)
    {
        super(props);

        this.placeholderText = 'Search';
    }

    render()
    {
        return (
            <div>
                <input type='search'
                    className={this.props.className}
                    placeholder={this.placeholderText}
                    onKeyUp={this.props.handleSearchProcesses}
                />
            </div>
        );
    }
}

SearchInput.propTypes = { };

SearchInput.defaultProps = { };

module.exports = SearchInput;

