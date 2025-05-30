const express = require("express");
const { google } = require("googleapis");
require("dotenv").config();

const app = express();
app.use(express.json());

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });
const SHEET_ID = process.env.SHEET_ID;

// Append function
async function appendToSheet({ from, message }) {
  const client = await auth.getClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A:B",
    valueInputOption: "RAW",
    resource: {
      values: [[from, message]],
    },
    auth: client,
  });
}

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const { from, message } = req.body;
    if (!from || !message) {
      return res.status(400).json({ error: "Missing 'from' or 'message'" });
    }
    await appendToSheet({ from, message });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error appending to sheet:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





// const { google } = require('googleapis');
// const fs = require('fs');
// const keys = require("./service-account.json"); // path to your JSON file

// const auth = new google.auth.JWT(
//     keys.client_email,
//     null,
//     keys.private_key,
//     ["https://www.googleapis.com/auth/spreadsheets"]
// );

// const sheets = google.sheets({ version: "v4", auth });

// const SHEET_ID = '1G-R_I4-IJX_tpXDI0uQh320jWvY62dyb3ZGVuSZrZcc'; 

// async function appendToSheet({ from, message }) {
//     const client = await auth.getClient();
//     const sheets = google.sheets({ version: 'v4', auth: client });

//     const now = new Date().toLocaleString();

//     await sheets.spreadsheets.values.append({
//         spreadsheetId: SHEET_ID,
//         range: 'Sheet1!A:C',
//         valueInputOption: 'USER_ENTERED',
//         resource: {
//             values: [[now, from, message]],
//         },
//     });
// }



// const express = require("express");
// const bodyParser = require("body-parser");

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Parse JSON
// app.use(bodyParser.json());

// // Verification endpoint for webhook setup
// app.get("/webhook", (req, res) => {
//     const VERIFY_TOKEN = "inspireOne1@098P"// Set this to a secure string
//     const mode = req.query["hub.mode"];
//     const token = req.query["hub.verify_token"];
//     const challenge = req.query["hub.challenge"];

//     if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
//         console.log("Webhook verified!");
//         res.status(200).send(challenge);
//     } else {
//         res.sendStatus(403);
//     }
// });

// // Receive incoming messages
// app.post("/webhook", async (req, res) => {
//     const body = req.body;

//     if (
//         body.object &&
//         body.entry &&
//         body.entry[0].changes &&
//         body.entry[0].changes[0].value.messages
//     ) {
//         const msg = body.entry[0].changes[0].value.messages[0];
//         const from = msg.from;
//         const message = msg.text?.body || "(non-text message)";

//         await appendToSheet({ from, message });

//         console.log("Message logged to sheet.");
//         res.sendStatus(200);
//     } else {
//         res.sendStatus(404);
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
