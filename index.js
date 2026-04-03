const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

const messages = [];

app.get("/", (req, res) => {
  res.send(`Server is running on port ${port}...`);
});

app.get("/messages", (req, res) => {
  res.json(messages);
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
  res.status(201).send("Message sent.");
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});