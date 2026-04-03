const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`Server is running on port ${port}`);
});

app.get("/messages", (req, res) => {
  res.json([]);
});

app.post("/messages", (req, res) => {
  const message = req.body;
  res.status(201).json(message);
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});