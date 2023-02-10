const functions = require("firebase-functions");
const express = require("express");
const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors);

const path = require("path");

app.use(express.urlencoded({
    extended: true
}))

app.get('/', (req, res) => {
    res.send('Hello world');
})

exports.app = functions.https.onRequest(app);

// Local development
const PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log("Server is running! " + PORT);