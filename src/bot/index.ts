import { Bot } from "grammy";
import { config } from "../config.js";
import { registerBotHandlers } from "./handlers.js";

export let bot: Bot | null = null;

export function initBot(): Bot | null {
  if (!config.botToken || config.botToken === "your_telegram_bot_token_here") {
    console.warn("⚠️ BOT_TOKEN aniqlanmadi. Telegram bot hozircha ishga tushmadi. .env faylida BOT_TOKEN ni o'rnating.");
    return null;
  }

  try {
    bot = new Bot(config.botToken);
    registerBotHandlers(bot);

    bot.catch((err) => {
      console.error("Bot xatoligi:", err);
    });

    bot.start({
      onStart: (botInfo) => {
        console.log(`🤖 Telegram bot @${botInfo.username} muvaffaqiyatli ishga tushdi!`);
      },
    });

    return bot;
  } catch (error) {
    console.error("Botni ishga tushirishda xatolik:", error);
    return null;
  }
}

