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
const Path = require('path');
const Url = require('url');

// Global reference to the (main) window object).
// Avoids automatic JS object garbage collection.
let win;

/**
 * Create the browser (main) window.
 */
function createWindow()
{
    win = new BrowserWindow({ width: 1200, height: 900 });

    // Load index.html
    win.loadURL(Url.format(
    {
        pathname: Path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Automatically open Chromium DevTools.
    // win.webContents.openDevTools();

    // Event emitted when window is closed.
    win.on('closed', () =>
    {
        // Deference window object for garbage collection.
        win = null;
    });
}

app.on('ready', createWindow);

