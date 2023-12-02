import express from "express";
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const chatFilePath = path.join(__dirname, 'chat.json');

app.use(express.static('images'));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Read the WML file and store its contents in a variable
const wmlFilePath = path.join(__dirname, 'http.wml');
const wmlPageTemplate = fs.readFileSync(wmlFilePath, 'utf8');

app.get("/http.wml", (req, res) => {
    res.type("text/vnd.wap.wml");
    res.sendFile("http.wml", { root: __dirname });
});

// Function to save chat messages to JSON file
function saveChatMessage(message) {
    fs.readFile(chatFilePath, (err, data) => {
        if (err && err.code === 'ENOENT') {
            // If the file doesn't exist, create it with the first message
            return fs.writeFile(chatFilePath, JSON.stringify([message]), (err) => {
                if (err) throw err;
            });
        } else if (err) {
            throw err;
        }

        // If the file exists, append the new message
        const messages = JSON.parse(data);
        messages.push(message);
        fs.writeFile(chatFilePath, JSON.stringify(messages), (err) => {
            if (err) throw err;
        });
    });
}

// Route to receive chat messages
app.post('/chat', (req, res) => {
    const message = { author: 'Anonymous', text: req.body.message };
    saveChatMessage(message);
    res.redirect('/http.wml');
});

app.get('/chat', (req, res) => {
    fs.readFile(chatFilePath, (err, data) => {
        if (err && err.code === 'ENOENT') {
            // If the file doesn't exist, send an empty chat page
            return res.type('text/vnd.wap.wml').send(wmlPageTemplate.replace('$(chatMessages)', 'No messages yet.'));
        } else if (err) {
            return res.status(500).send('Error reading chat file');
        }

        // Format the chat messages for WML display
        const messages = JSON.parse(data);
        const formattedMessages = messages.map(msg => `<p>${msg.author}: ${msg.text}</p>`).join('');

        // Inject the formatted messages into the WML page
        const wmlPageWithMessages = wmlPageTemplate.replace('$(chatMessages)', formattedMessages);
        res.type('text/vnd.wap.wml').send(wmlPageWithMessages);
    });
});

app.listen(3000, () => {
    console.log("Express server initialized");
});
