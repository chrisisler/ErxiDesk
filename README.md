# ErxiDesk

A clean interface for things I do in the terminal.

## About

ErxiDesk is a Windows desktop app built with Electron + React.

- Start, monitor, and kill processes
- Traverse through directories
- Play music, videos, and view images
- Set reminders

## Build
- ```npm install```

## Run + Develop
- ```npm run dev```
- ```npm start```

### Pre-requisites
1. Ruby
2. Sass

## To-do

- Replace getProcesses::makeProcessObj usages with the below function.
  // fn is given [key, val] as an arg
  const zipObjBy = R.curryN(3, (fn, keys, vals) => R.fromPairs(R.zipWith(R.pipe(R.pair, fn), keys, vals)));
  or
  const zipObjBy = (fn, keys, vals) => R.fromPairs(R.zipWith(R.pipe(R.pair, fn), keys, vals));

- Add ability to start processes

- Add tests (mocha/chai/should) tests must support react/jsx

- Add a visual notification to show process kill success or error

- Fix table header for processes

- Add button at bottom of processes table to scroll back to top

- Add tabs/header

- Right click process property title to display dropdown with option to hide that column (??)

- Remove util directory

