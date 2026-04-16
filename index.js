import express from "express";

const app = express();
app.use(express.json());

const SLACK_TOKEN = "xoxb-10960574360656-10916976075367-fukJwrS0nKpXeSReXGQNVh5n"; // 👈 pega tu token real aquí

// Ruta base
app.get("/", (req, res) => {
  res.send("Bot activo 🚀");
});

// Eventos de Slack
app.post("/slack/events", async (req, res) => {
  const data = req.body;

  // Verificación de Slack
  if (data.type === "url_verification") {
    return res.send(data.challenge);
  }

  const event = data.event;

  if (!event || event.bot_id) {
    return res.sendStatus(200);
  }

  let text = event.text || "";
  text = text.replace(/<@[^>]+>/g, "").trim();

  const channel = event.channel;

  await sendMessage(channel, `Recibí: ${text}`);

  return res.sendStatus(200);
});

// Enviar mensaje a Slack
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
