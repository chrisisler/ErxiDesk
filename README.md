# ErxiDesk

A clean interface for things I do in the terminal.

## About

ErxiDesk is a Windows desktop app built with Electron + React.

- Start, monitor, and kill processes
- Traverse through directories
- Play music, videos, and view images
- Set reminders TBD

## Build
- ```npm install```

## Run + Develop
- ```npm run dev```
- ```npm start```

### Pre-requisites
1. Ruby
2. Sass

## To-do
- Add ability to actually kill a process in the dropdown menu ( needs work )
  - Add a visual notification to show pkill success/error (async?)

- Add ability to refresh processes
- Add ability to search for running processes
- Show total number of processes running
- Add option to show top N elements using R.take(N)

- Add "unhide" this process to dropdown (only for already hidden processes)
- Add "unhide" both/all processes of this name to dropdown (only for already hidden procs)

- Add "hide" this single process to dropdown

- Fix table header for processes

- Add button at bottom of processes table to scroll back to top

- Add tabs/header

- Right click process property title to display dropdown with option to hide that column

