import express from "express";

const app = express();
app.use(express.json());

app.post("/slack/events", (req, res) => {
  const data = req.body;

  // 🔥 ESTO ES LO QUE SLACK NECESITA
  if (data.type === "url_verification") {
    return res.send(data.challenge);
  }

  return res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Bot activo 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
