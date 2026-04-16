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

app.listen(3000, () => {
  console.log("Server running");
});
