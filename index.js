const express = require("express");
const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.json());

const messages = [];

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

app.post("/messages", (req, res) => {
  const { text, sender } = req.body;

  if (!text || !sender) {
    return res.status(400).json({ error: "Text and its sender are required!" });
  }

  const message = {
    id: messages.length,
    text: text,
    sender: sender,
    createdAt: new Date().toISOString()
  }
  messages.push(message);
  res.status(201).json(message);
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});