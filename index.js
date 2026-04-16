import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const SLACK_TOKEN = "xoxb-TU-TOKEN-AQUI"; // 👈 tu token aquí

// Ruta base
app.get("/", (req, res) => {
  res.send("Bot activo 🚀");
});

// Eventos de Slack
app.post("/slack/events", async (req, res) => {
  const data = req.body;

  // verificación
  if (data.type === "url_verification") {
    return res.send(data.challenge);
  }

  const event = data.event;

  if (!event || event.bot_id) {
    return res.sendStatus(200);
  }

  // limpiar mensaje
  let text = event.text || "";
  text = text.replace(/<@[^>]+>/g, "").trim();

  const channel = event.channel;

  // 🔥 RESPUESTA DEL BOT
  await sendMessage(channel, `Recibí: ${text}`);

  return res.sendStatus(200);
});

// enviar mensaje
async function sendMessage(channel, text) {
  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SLACK_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      channel,
      text
    })
  });
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
