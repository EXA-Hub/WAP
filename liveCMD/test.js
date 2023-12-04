
/**
 * 
 * Good Job (:
 * 
 * const { VTexec } = require('open-term');
 * VTexec('help'); // Runs "help" command.
 */




/**
 * 
 * DO NOT RUN THIS AT ANY COST !!
 * 

const { exec } = require('child_process');
exec('node test.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});

 */