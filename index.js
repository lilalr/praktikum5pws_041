const express = require("express");
const crypto = require("crypto");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

app.post("/generate-api-key", (req, res) => {
  console.log("Request diterima di /generate-api-key");
  const key = "sk_live_" + crypto.randomBytes(32).toString("hex");
  res.json({ apiKey: key });
});

