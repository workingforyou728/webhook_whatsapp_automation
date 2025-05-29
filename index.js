const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json', 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = 'your-google-sheet-id-here'; 

async function appendToSheet({ from, message }) {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const now = new Date().toLocaleString();

    await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!A:C',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[now, from, message]],
        },
    });
}



const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON
app.use(bodyParser.json());

// Verification endpoint for webhook setup
app.get("/webhook", (req, res) => {
    const VERIFY_TOKEN = poenv.passcode // Set this to a secure string
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified!");
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Receive incoming messages
app.post("/webhook", async (req, res) => {
    const body = req.body;

    if (
        body.object &&
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0].value.messages
    ) {
        const msg = body.entry[0].changes[0].value.messages[0];
        const from = msg.from;
        const message = msg.text?.body || "(non-text message)";

        await appendToSheet({ from, message });

        console.log("Message logged to sheet.");
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
