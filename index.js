import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔑 TU TOKEN DE SLACK
const SLACK_TOKEN = "xoxb-10960574360656-10916976075367-fukJwrS0nKpXeSReXGQNVh5n";

// 🔗 TU URL DE APPS SCRIPT
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzd62NFKpjKbK4NO3CjhRIfn6JKJGwD6km0qtui7JDYwcOkuWIlQ2mxWC8jT6y2eLi70Q/exec";

// Ruta base
app.get("/", (req, res) => {
  res.send("Bot activo 🚀");
});

// Eventos de Slack
app.post("/slack/events", async (req, res) => {
  const data = req.body;

  // ✅ Verificación Slack
  if (data.type === "url_verification") {
    return res.send(data.challenge);
  }

  const event = data.event;

  // Evitar loops
  if (!event || event.bot_id) {
    return res.sendStatus(200);
  }

  // Limpiar mensaje
  let text = event.text || "";
  text = text.replace(/<@[^>]+>/g, "").trim();

  const channel = event.channel;

  try {
    // 🔥 LLAMAR A GOOGLE APPS SCRIPT
    const response = await fetch(
      `${SHEET_API_URL}?q=${encodeURIComponent(text)}`
    );

    const result = await response.text();

    await sendMessage(channel, result);

  } catch (error) {
    await sendMessage(channel, "❌ Error obteniendo datos");
  }

  return res.sendStatus(200);
});

// 📤 Enviar mensaje a Slack
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
