const React = require('react');
const ReactDom = require('react-dom');

class Fake extends React.Component
{
    render()
    {
        return (
            <h1>Its working!</h1>
        );
    }
}


ReactDom.render(<Fake />, document.getElementById('app'));

