const React = require('react');
const ReactDOM = require('react-dom');

class Foobar extends React.Component
{
    render()
    {
        return (
            <h1>it works!</h1>
        );
    }
}

ReactDOM.render(<Foobar/>, document.getElementById('app'));
