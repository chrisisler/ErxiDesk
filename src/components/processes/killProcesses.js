'use strict';

const CP = require('child_process');

const processName = 'firefox';

// sync solution
try
{
    // const output = CP.execSync(command, options);
    // console.log('output is:', output);
}
catch (e)
{
    // console.log('e is:', e);
}


function killProcess(processName, func)
{
    const command = `taskkill /f /im ${processName}.exe`;
    const options = { encoding: 'utf8' };

    CP.exec(command, options, (error, stdout, stderr) =>
    {
        if (error)
        {
            console.error(`exec error: ${error}`);
            return;
        }
        else if (stdout)
        {
            console.log('stdout is:', stdout);
        }
        else if (stderr)
        {
            console.log('stderr is:', stderr);
        }
    });
}

killProcess(processName);

