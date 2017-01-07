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

const WINDOW_MIN_WIDTH = 800;
const WINDOW_MIN_HEIGHT = 400;
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
        minWidth: WINDOW_MIN_WIDTH,
        minHeight: WINDOW_MIN_HEIGHT,
        width: WINDOW_DEFAULT_WIDTH,
        height: WINDOW_DEFAULT_HEIGHT,
        autoHideMenuBar: true,
        title: 'ErxiDesk'
    };

    mainWindow = new BrowserWindow(windowOptions);

    // Load index.html from webpack-dev-server at http://localhost:8080/
    mainWindow.loadURL('http://localhost:8080/');

    // Load index.html
    // mainWindow.loadURL(Url.format(
    // {
    //     pathname: Path.join(__dirname, './index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));

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

