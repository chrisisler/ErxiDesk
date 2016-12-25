# ErxiDesk

A clean interface for things I do in the terminal.

## About

ErxiDesk is a Windows desktop app built with Electron + React.

- Start, monitor, and kill processes
- Traverse through directories
- Play music, videos, and view images
- Set reminders
- TBD

## Build
- ```npm install```

## Run + Develop
- ```npm run dev```
- ```npm start```

### Pre-requisites
1. Ruby
2. Sass

## To-do
1. ProcessData dropdown:
    * Kill process <name> with PID <pid>
    * Kill all N <name> processes
    * Summarize this process
        - Group all processes of this name into one super process, marked with a symbol (*) somehow
        - Display an aggregate/total memory usage sum
        - Add a 'css-' class for this aggregate process to change text color or make it different somehow
1. Add ability to search for running processes
1. Right click process property title to display dropdown with option to hide that column
1. Show total number of processes running
1. Add ability to actually kill a process in the dropdown menu
  - Add a visual notification to show pkill success/error (async?)
1. Fix table header for processes
1. Add button at bottom of processes table to scroll back to top
1. Add option to show top N elements using R.take(N)
1. Add dropdown option to hide this current process (with that unique PID) and/or hide all processes of that name (using R.whereEq or R.without)
1. Add tabs/header


