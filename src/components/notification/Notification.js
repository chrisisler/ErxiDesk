'use strict';

const React = require('react');

class Notification extends React.Component
{
    constructor(props)
    {
        super(props);
        this.cssClass = 'css-notification-wrap';
    }

    render()
    {
        return (
            <div
                className={this.cssClass}
            >
                <p>This is a new Notification component.</p>
            </div>
        );
    }
}

Notification.propTypes = {};

Notification.defaultProps = {};

module.exports = Notification;

