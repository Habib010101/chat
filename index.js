const path = require("path");
require("dotenv").config({
  override: true,
  path: path.join( __dirname, ".env")
});

const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());

// Main page (later login page)
app.get("/", (req, res) => {
  res.send(`Server is running on port ${port}...`);
});

// Chat start page
app.use("/chat", express.static("public"));

app.get("/chat", (res, req) => {
  res.status(200);
});

// API to display messages
app.get("/api/messages", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM messages ORDER BY created_at");
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error!"});
  }
});

// API to send message
app.post("/api/messages", async (req, res) => {
  const { text, sender } = req.body;

  if (!text || !sender) {
    return res.status(400).json({ error: "Text and its sender are required!" });
  }

  // pool.query(INSERT INTO messages (text, sender) VALUES ( ${text}, ${sender}));
  // If text is something malicious, do i want it merged into the SQL string itself?
  try {
    // rows is an array with affected row(s)
    const { rows } = await pool.query("INSERT INTO messages (text, sender, created_at) VALUES ($1, $2, NOW()) RETURNING *", [text, sender]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error!"});
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});