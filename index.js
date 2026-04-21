import express from "express";

const app = express();
app.use(express.json());

const SLACK_TOKEN = "xoxb-10960574360656-10916976075367-fukJwrS0nKpXeSReXGQNVh5n";
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzd62NFKpjKbK4NO3CjhRIfn6JKJGwD6km0qtui7JDYwcOkuWIlQ2mxWC8jT6y2eLi70Q/exec";

// Ruta base
app.get("/", (req, res) => {
  res.send("Bot activo 🚀");
});

// Eventos Slack
app.post("/slack/events", async (req, res) => {
  const data = req.body;

  // ✅ RESPONDER INMEDIATO (evita duplicados y delays)
  res.sendStatus(200);

  // 🚫 evitar reintentos de Slack
  if (req.headers["x-slack-retry-num"]) return;

  // Verificación inicial
  if (data.type === "url_verification") return;

  const event = data.event;

  // 🚫 ignorar bots o basura
  if (!event || event.bot_id) return;

  // ✅ solo responder cuando mencionan al bot
  if (event.type !== "app_mention") return;

  let text = event.text || "";
  text = text.replace(/<@[^>]+>/g, "").trim();

  const channel = event.channel;

  try {
    const response = await fetch(
      `${SHEET_API_URL}?q=${encodeURIComponent(text)}`
    );

    const result = await response.text();

    await sendMessage(channel, result);

  } catch (error) {
    console.error("ERROR:", error);
    await sendMessage(channel, "❌ Error obteniendo datos");
  }
});

// enviar mensaje a Slack
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
  console.log("Server corriendo en puerto " + PORT);
});
