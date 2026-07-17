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
    const { rowCount } = await pool.query("SELECT 1 FROM users WHERE username = $1", [usernameValue]);

    if (rowCount > 0) {
      return res.status(409).json({
        message: "Username taken."
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Something went wrong..."
    });
  }

  try {
    const passwordHash = await Bcrypt.hash(passwordValue, saltRounds);
    await pool.query("INSERT INTO users (username, password_hash) VALUES ($1, $2)", [usernameValue, passwordHash]);
    res.status(201).json({
      message: "Account created successfully."
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Something went wrong..."
    });
  }
});

app.post("/api/login", async (req, res) => {
  const {username, password} = req.body;

  const usernameValue = username?.trim();
  const passwordValue = password?.trim();

  if (!usernameValue || !passwordValue) {
    return res.status(400).json({
      error: "Username and password are required."
    })
  }

  try {
    const { rows, rowCount } = await pool.query("SELECT id, username, password_hash FROM users WHERE username = $1", [usernameValue]);

    if (rowCount < 1) {
      return res.status(401).json({
        message: "Invalid credentials."
      });
    }

    const user = rows[0];

    const passwordMatches = await Bcrypt.compare(passwordValue, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid credentials."
      });
    }

    req.session.userId = user.id;
    req.session.username = user.username;

    res.status(200).json({
      message: "Login successful."
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Something went wrong..."
    });
  }
});

// API to display messages
app.get("/api/messages", requireLogin, async (req, res) => {

  try {
    const { rows } = await pool.query("SELECT messages.id, messages.text, messages.created_at, users.username FROM messages JOIN users ON messages.sender_id = users.id ORDER BY created_at");
    res.status(200).json(rows);
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
