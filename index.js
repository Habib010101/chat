const Express = require('express');
const Http = require('http');
const WebSocket = require('ws');
const Bcrypt = require('bcrypt');
const session = require('express-session')
const Path = require('path');
const { Pool } = require('pg');
require('dotenv').config({
  override: true,
  path: Path.join(__dirname, '.env')
});

const app = Express();
const server = Http.createServer(app);
const port = 3000;
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 5 // 5 minutes
  }
});

app.use(Express.static(Path.join(__dirname, 'public')));
app.use(Express.json());
app.use(sessionMiddleware);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  next();
}

// Main page (later login page)
app.get("/", (req, res) => {
  res.sendFile(Path.join(__dirname, 'public', 'homepage.html'));
});

app.get("/register", async (req, res) => {
  res.sendFile(Path.join(__dirname, 'public', 'register.html'));
});

app.get("/login", (req, res) => {
  res.sendFile(Path.join(__dirname, "public", "login.html"));
});

app.post("/api/register", async (req, res) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const passwordRegex = /^\S{8,30}$/;
  const saltRounds = 10;

  const {username, password} = req.body;
  const usernameValue = username?.trim();
  const passwordValue = password?.trim();

  const isUsernameValid = usernameRegex.test(usernameValue);
  const isPasswordValid = passwordRegex.test(passwordValue);

  if (!isUsernameValid || !isPasswordValid) {
    return res.status(400).json({
      error: "Invalid username or password format."
    });
  }

  try {
    const { rows } = await pool.query("SELECT * FROM messages ORDER BY created_at");
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error!"});
  }
});

// API to send message
// Now messages are being sent through web socket
/*
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
*/

server.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Client connected.");

  ws.on("message", async (rawMessage) => {
    console.log(`Received message: ${rawMessage}`);

    try {
      const {text, sender} = JSON.parse(rawMessage.toString());

      if (!text?.trim() || !sender?.trim()) {
        return;
      }

      const { rows } = await pool.query("INSERT INTO messages (text, sender, created_at) VALUES ($1, $2, NOW()) RETURNING *", [text, sender]);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(rows[0]));
        }
      });
    } catch (err) {
      console.error(err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected.");
  });
});
