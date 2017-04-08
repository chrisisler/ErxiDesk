'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

class Notification extends React.Component
{
    constructor(props)
    {
        super(props);
        this.cssClass = 'css-notification-wrap';

        setTimeout(() =>
        {
            this.closeNotification();
        }, 4000);
    }

    closeNotification()
    {
        ReactDOM.unmountComponentAtNode(document.getElementById('notification'));
    }

    render()
    {
        return (
            <div
                onClick={this.closeNotification.bind(this)}
                className={this.cssClass}
            >
                <p>{this.props.text}</p>
            </div>
        );
    }
}

Notification.propTypes = {};

Notification.defaultProps = {};

module.exports = Notification;

