'use strict';

/**
 * Main entry point for Electron application.
 */

process.on('uncaughtException', (error) =>
{
    process.emitWarning(`Uncaught exception: ${error}`);
    process.exit(1);
});

const {app, BrowserWindow} = require('electron');

// Global reference to the (main) window object.
let mainWindow = null;

// Currently, there is no support for running multiple instance of the app at
// the same time.
let allowMultipleInstances = false;

/*
const appAlreadyRunning = app.makeSingleInstance(() =>
{
    // What to do when someone tries to run a second instance of the app.
    if (allowMultipleInstances)
    {
        if (mainWindow.isMinimized()) { mainWindow.restore(); }
        mainWindow.focus();
    }
    else
    {
        app.quit();
    }
});

// Currently, there is no support for running multiple instance of the app at
// the same time.
if (appAlreadyRunning)
{
    app.relaunch();
}
*/

const WINDOW_MIN_WIDTH = 800;
const WINDOW_MIN_HEIGHT = 600;
const WINDOW_DEFAULT_WIDTH = 1200;
const WINDOW_DEFAULT_HEIGHT = 900;

/**
 * Create the browser (main) window.
 */
function createWindow()
{
    const Url = require('url');
    const Path = require('path');

    const windowOptions =
    {
        minWidth: WINDOW_MIN_WIDTH,   // Not working - unless this is min starting value.
        minHeight: WINDOW_MIN_HEIGHT, // Not working - unless this is min starting value.
        width: WINDOW_DEFAULT_WIDTH,
        height: WINDOW_DEFAULT_HEIGHT,
        icon: './images/ErxiDesk-Icon-1.0.png'
    };

    mainWindow = new BrowserWindow(windowOptions);

    // Load index.html
    mainWindow.loadURL(Url.format(
    {
        pathname: Path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Automatically open Chromium DevTools.
    mainWindow.webContents.openDevTools();

    // When the window is closed, dereference the window
    // object for garbage collection
    mainWindow.on('closed', () =>
    {
        mainWindow = null;
    });
}

// When the app is ready, display the window.
app.on('ready', createWindow);

