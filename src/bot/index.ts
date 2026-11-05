import { Bot, webhookCallback } from "grammy";
import express from "express";
import { config } from "../config.js";
import { registerBotHandlers } from "./handlers.js";

export let bot: Bot | null = null;

export async function resetBotMenuAndCommands(b: Bot) {
  try {
    // 1. Reset chat menu button to DEFAULT (removes "Launch App" web app button completely)
    await b.api.setChatMenuButton({
      menu_button: { type: "default" },
    });
    console.log("🧹 Telegram chat menu buttoni default holatga qaytarildi (Launch App tugmasi olib tashlandi).");

    // 2. Clear old commands from BotFather and set fresh clean ones
    await b.api.deleteMyCommands();
    await b.api.setMyCommands([
      { command: "start", description: "Botni ishga tushirish va dori qo'shish" },
      { command: "add", description: "Yangi dori qo'shish" },
      { command: "help", description: "Qo'llanma va yordam" },
    ]);
    console.log("✅ Yangi toza Telegram buyruqlari o'rnatildi (/start, /add, /help).");
  } catch (err: any) {
    console.warn("Bot menyusini tozalashda ogohlantirish:", err.message);
  }
}

export async function setupBot(app: express.Express): Promise<Bot | null> {
  if (!config.botToken || config.botToken === "your_telegram_bot_token_here") {
    console.warn("⚠️ BOT_TOKEN aniqlanmadi. Telegram bot hozircha ishga tushmadi.");
    return null;
  }

  try {
    bot = new Bot(config.botToken);

    // Logging middleware for every incoming update
    bot.use(async (ctx, next) => {
      console.log(
        `📩 [Telegram] User: ${ctx.from?.id} (@${ctx.from?.username || "no_user"}), Text: "${ctx.message?.text || ""}", HasPhoto: ${Boolean(ctx.message?.photo)}`
      );
      await next();
    });

    // Register all bot commands and flows
    registerBotHandlers(bot);

    // Catch bot runtime errors
    bot.catch((err) => {
      console.error("❌ Telegram bot xatoligi:", err.error || err);
    });

    // Wipe Launch App menu button and old commands
    await resetBotMenuAndCommands(bot);

    // Check if running on Render / Production with public HTTPS
    const isRender = Boolean(process.env.RENDER) || process.env.PORT === "10000" || config.isProduction;

    if (isRender) {
      // 1. Production (Render) -> Use Webhook
      const domain = process.env.RENDER_EXTERNAL_URL || "https://biznesgo.onrender.com";
      const webhookPath = "/api/telegram-webhook";
      const webhookUrl = `${domain}${webhookPath}`;

      // Register Express webhook endpoint
      app.use(webhookPath, webhookCallback(bot, "express"));

      // Set Webhook on Telegram
      await bot.api.setWebhook(webhookUrl, {
        drop_pending_updates: true,
      });

      const me = await bot.api.getMe();
      console.log(`🤖 Telegram bot @${me.username} Render Webhook rejimida ulandi: ${webhookUrl}`);
    } else {
      // 2. Local development -> Clear old webhook and run polling
      try {
        await bot.api.deleteWebhook({ drop_pending_updates: true });
        console.log("🧹 Eski webhook tozalandi, lokal polling boshlanmoqda.");
      } catch (e: any) {
        console.warn("deleteWebhook xabari:", e.message);
      }

      bot.start({
        drop_pending_updates: true,
        onStart: (botInfo) => {
          console.log(`🤖 Telegram bot @${botInfo.username} polling rejimida ishlamoqda!`);
        },
      });
    }

    return bot;
  } catch (error) {
    console.error("❌ Botni ishga tushirishda xatolik:", error);
    return null;
  }
}
