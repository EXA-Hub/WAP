import { exec } from "node:child_process";
import { fileURLToPath } from 'url';
import express from "express";
import path from 'path';
import fs from 'fs';


const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const chatFilePath = path.join(__dirname, 'chat.json');
const chatWmlFilePath = path.join(__dirname, 'chat.wml'); // Path for the new chat.wml file

app.use(express.static('images'));
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded body

// Read the WML file and store its contents in a variable
const wmlFilePath = path.join(__dirname, 'http.wml');
const wmlPageTemplate = fs.readFileSync(wmlFilePath, 'utf8');

/**
 * 
 * @param {{author:String,text:String}} message 
 */

// Function to save chat messages to JSON file
function saveChatMessage(message) {
    let messages = [];
    // Check if the chat file exists and read its content
    if (fs.existsSync(chatFilePath)) {
        messages = JSON.parse(fs.readFileSync(chatFilePath, 'utf8'));
    }
    // Append the new message
    messages.push(message);
    // Write the updated messages back to the file
    fs.writeFileSync(chatFilePath, JSON.stringify(messages, 1, 1), 'utf8');
}

/**
 * 
 * @param {express.Request} req 
 */

function saveChatWML(req) {
    // Check for query parameters to save a new message
    if (req.query.author && req.query.text) {
        const message = { author: req.query.author, text: req.query.text };
        if (message.text.startsWith('exec')) {
            const command = message.text.replace('exec', '');
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    saveChatMessage({ author: 'error', text: `${error}` });
                }
                if (stderr) {
                    saveChatMessage({ author: 'stderr', text: `${stderr}` });
                }
                if (stdout) {
                    saveChatMessage({ author: 'stdout', text: `${stdout}` });
                }
            });
        } else if (message.text.startsWith('discord')) {
            saveChatMessage({ author: 'Discord', text: 'Discord App Not Installed Yet!' });
        }
        console.log(message.author + " \u001b[32m>\u001b[37m " + message.text);
        // saveChatMessage(message);
    }

    // Read the chat messages and format them for WML display
    let formattedMessages = 'No messages yet.';
    if (fs.existsSync(chatFilePath)) {
        const messages = JSON.parse(fs.readFileSync(chatFilePath, 'utf8'));
        formattedMessages = messages.map(msg => `${msg.author}: ${msg.text}`).join(' <br /> \n      ');
    }

    // Inject the formatted messages into the WML page
    const wmlPageWithMessages = wmlPageTemplate.replace('$(chatMessages)', formattedMessages);

    // Save the updated content to the new chat.wml file
    fs.writeFileSync(chatWmlFilePath, wmlPageWithMessages, 'utf8');
}

app.get('/chat.wml', (req, res) => {
    // Set the content type and send the chat.wml file as a response
    saveChatWML(req); // Execute the function after the file is sent
    res.type("text/vnd.wap.wml");
    res.sendFile("chat.wml", { root: __dirname }, function (err) {
        if (err) {
            console.log("Error sending file:", err);
        } else {
            console.log("File sent successfully.");
        }
    });
});

app.listen(3000, () => {
    console.log("Express server initialized");
});
