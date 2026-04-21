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

  // ✅ responder inmediato
  res.sendStatus(200);

  // evitar duplicados
  if (req.headers["x-slack-retry-num"]) return;

  // verificación inicial
  if (data.type === "url_verification") return;

  const event = data.event;

  // ignorar bots
  if (!event || event.bot_id) return;

  // 🔥 SOLO responder en DM o menciones
  if (event.channel_type !== "im" && event.type !== "app_mention") {
    return;
  }

  let text = event.text || "";

  // limpiar mención
  text = text.replace(/<@[^>]+>/g, "").trim();

  const channel = event.channel;
  const userId = event.user;

  try {
    const userName = await getUserName(userId);

    // 👇 BONUS: saludo automático
    if (!text || text.toLowerCase() === "hi" || text.toLowerCase() === "hello") {
      await sendMessage(channel, `Hey ${userName} 👋\nHow can I help you today?`);
      return;
    }

    // llamar Apps Script
    const response = await fetch(
      `${SHEET_API_URL}?q=${encodeURIComponent(text)}&user=${encodeURIComponent(userName)}`
    );

    const result = await response.text();

    await sendMessage(channel, result);

  } catch (error) {
    console.error(error);
    await sendMessage(channel, "❌ Error obteniendo datos");
  }
});

/**
 * 🔥 Obtener nombre real
 */
async function getUserName(userId) {
  try {
    const res = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
      headers: {
        Authorization: `Bearer ${SLACK_TOKEN}`
      }
    });

    const data = await res.json();

    if (data.ok) {
      return data.user.real_name || data.user.name;
    }

    return userId;

  } catch {
    return userId;
  }
}

/**
 * 📩 Enviar mensaje
 */
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
