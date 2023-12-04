const { exec } = require('child_process');
const fs = require('fs');

// Function to execute a command and write the result to a text file
function executeAndSave(command, outputFile) {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return;
        }
        if (stdout) {
            console.log(`Stdout: ${stdout}`);
        }
        // Write the stdout to the output file
        fs.writeFile(outputFile, stdout, (err) => {
            if (err) {
                console.error(`Error writing to file: ${err.message}`);
            } else {
                console.log(`Output saved to ${outputFile}`);
            }
        });
    });
}

// Example usage
const commandToExecute = 'commands';
const outputFilePath = 'result.txt';

executeAndSave(commandToExecute, outputFilePath);