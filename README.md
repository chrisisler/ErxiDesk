# ErxiDesk

A clean interface for things I do in the terminal.

## About

ErxiDesk is a Windows desktop app built with Electron + React.

ErxiDesk allows users to do the following all from a clean interface:
- [x] Start, monitor, and kill processes
- [ ] Traverse through directories
- [ ] Play music, videos, and view images
- [ ] Set reminders
- [ ] TBD

## Build
- ```npm install```

## Run
- ```npm start```

## Develop

### Pre-requisites
1. Ruby
2. Sass

## To-do
- React refactor
- Add ability to search for running processes
- Right click process property title to display dropdown with option to hide that column
- Show total number of processes running
- Add ability to actually kill a process in the dropdown menu
  - Add a visual notification to show pkill success/error (async?)
- Add status bar footer showing date, time, battery info, cpu info, etc
- Fix table header for processes
- Add button at bottom of processes table to scroll back to top
- Add option to show top N elements using R.take(N)
- Add option to remove duplicates and show summation of total memory usage
- Add dropdown option to hide this current process (with that unique PID) and/or hide all processes of that name (using R.whereEq or R.without)

- ProcessData dropdown:
    * Summarize this process
        - Group all processes of this name into one super process, marked with a symbol (*) somehow
        - Display an aggregate/total memory usage sum
        - Add a 'css-' class for this aggregate process to change text color or make it different somehow
    * Kill this process (PID: NNNN)
    * Kill all N <process name> processes

