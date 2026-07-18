export default async function handler(
  req: { method: string; body: { name?: unknown; message?: unknown } },
  res: {
    status: (code: number) => {
      json: (body: unknown) => void;
    };
  }
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, message } = req.body ?? {};

  if (
    !name ||
    !message ||
    typeof name !== "string" ||
    typeof message !== "string"
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }

  if (name.trim().length === 0 || message.trim().length === 0) {
    return res.status(400).json({ error: "Input cannot be empty" });
  }
  if (name.length > 200 || message.length > 2000) {
    return res.status(400).json({ error: "Input too long" });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const text = `📬 *New portfolio contact message*\n\n*From:* ${name.trim()}\n\n*Message:*\n${message.trim()}`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Telegram API error:", errBody);
      throw new Error("Telegram API error");
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Telegram send failed:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
}
