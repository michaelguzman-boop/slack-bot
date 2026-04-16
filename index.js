import express from "express";

const app = express();
app.use(express.json());

// 👉 ruta principal (esto arregla el "Not Found")
app.get("/", (req, res) => {
  res.send("Bot activo 🚀");
});

// 👉 endpoint para Slack
app.post("/slack/events", (req, res) => {
  const data = req.body;

  if (data.type === "url_verification") {
    return res.send(data.challenge);
  }

  return res.sendStatus(200);
});

// 👉 puerto correcto (IMPORTANTE)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
