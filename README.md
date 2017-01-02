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
- Dropdown fadein/out
- ProcessData summarization ( needs work )
- ProcessData multikill ( needs work )
- Add ability to actually kill a process in the dropdown menu ( needs work )
  - Add a visual notification to show pkill success/error (async?)


- Add ability to refresh processes
- Add ability to search for running processes
- Show total number of processes running


- Fix table header for processes

- Add button at bottom of processes table to scroll back to top

- Add option to show top N elements using R.take(N)

- Add dropdown option to HIDE this current process (with that unique PID) and/or HIDE all processes of that name (using R.whereEq or R.without)

- Add tabs/header

- Right click process property title to display dropdown with option to hide that column

