import { Bot, Context } from "grammy";
import { MAIN_KEYBOARD, UNIT_KEYBOARD, CONFIRM_KEYBOARD } from "./keyboards.js";
import { createMedicine, getAllMedicines } from "../services/medicineService.js";

type Step = "IDLE" | "WAITING_PHOTO" | "WAITING_NAME" | "WAITING_UNIT" | "WAITING_QUANTITY" | "CONFIRM";

interface UserSession {
  step: Step;
  photo_file_id?: string;
  name?: string;
  unit?: string;
  quantity?: string;
}

const sessions = new Map<number, UserSession>();

function getSession(userId: number): UserSession {
  let session = sessions.get(userId);
  if (!session) {
    session = { step: "IDLE" };
    sessions.set(userId, session);
  }
  return session;
}

function clearSession(userId: number) {
  sessions.delete(userId);
}

export function registerBotHandlers(bot: Bot) {
  // /start command
  bot.command("start", async (ctx) => {
    const userId = ctx.from?.id;
    if (userId) clearSession(userId);

    const userName = ctx.from?.first_name || "Foydalanuvchi";
    await ctx.reply(
      `Assalomu alaykum, <b>${userName}</b>!\n\n` +
      `💊 <b>Dori hisobi botiga xush kelibsiz.</b>\n\n` +
      `Siz bu yerda dorilarning rasmi, nomi va o'lchov birliklarini (litr, kg, dona, ml) kiritishingiz mumkin. ` +
      `Barcha ma'lumotlar to'g'ridan-to'g'ri <b>Admin Panel</b>ga tushadi.\n\n` +
      `Boshlash uchun quyidagi <b>➕ Dori qo'shish</b> tugmasini bosing:`,
      {
        parse_mode: "HTML",
        ...MAIN_KEYBOARD,
      }
    );
  });

  // Cancel command / text
  bot.hears(["❌ Bekor qilish", "/cancel"], async (ctx) => {
    const userId = ctx.from?.id;
    if (userId) clearSession(userId);
    await ctx.reply("❌ Amaliyot bekor qilindi.", MAIN_KEYBOARD);
  });

  // Start adding medicine
  bot.hears(["➕ Dori qo'shish", "/add"], async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    sessions.set(userId, { step: "WAITING_PHOTO" });
    await ctx.reply(
      "📸 <b>1-qadam:</b> Iltimos, dorining rasmini yuboring (kameraga olib yoki galereyadan):",
      {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [[{ text: "❌ Bekor qilish" }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  });

  // Recent medicines list
  bot.hears("📋 Oxirgi qo'shilganlar", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const list = await getAllMedicines();
    const userMedicines = list.filter((m) => String(m.telegram_user_id) === String(userId)).slice(0, 5);

    if (userMedicines.length === 0) {
      await ctx.reply("Siz hali birorta ham dori qo'shmadingiz. '➕ Dori qo'shish' tugmasini bosing.", MAIN_KEYBOARD);
      return;
    }

    let text = "📋 <b>Siz qo'shgan oxirgi dorilar:</b>\n\n";
    userMedicines.forEach((m, idx) => {
      text += `${idx + 1}. <b>${m.name}</b> — ${m.quantity} ${m.unit} <i>(${new Date(m.created_at).toLocaleDateString()})</i>\n`;
    });
    text += "\nBarcha ro'yxatni ko'rish uchun <b>Admin Panel</b>ga kiring.";

    await ctx.reply(text, { parse_mode: "HTML", ...MAIN_KEYBOARD });
  });

  // Help command
  bot.hears(["ℹ️ Yordam", "/help"], async (ctx) => {
    await ctx.reply(
      "ℹ️ <b>Qanday ishlatiladi:</b>\n\n" +
      "1. <b>➕ Dori qo'shish</b> tugmasini bosing.\n" +
      "2. Dorining rasmini yuboring.\n" +
      "3. Dori nomini yozing.\n" +
      "4. O'lchov birligini tanlang (Litr, ml, kg, dona...).\n" +
      "5. Miqdorini kiriting (masalan: 2 litr yoki 10 dona).\n" +
      "6. Saqlash tugmasini tasdiqlang.\n\n" +
      "Ma'lumotlar avtomatik Admin Panelga va Neon bazaga tushadi.",
      { parse_mode: "HTML", ...MAIN_KEYBOARD }
    );
  });

  // Handle incoming photos
  bot.on("message:photo", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const session = getSession(userId);
    if (session.step !== "WAITING_PHOTO") {
      // If user sends photo unexpectedly, ask if they want to start adding
      session.step = "WAITING_NAME";
    }

    const photos = ctx.message.photo;
    const largestPhoto = photos[photos.length - 1];
    session.photo_file_id = largestPhoto.file_id;
    session.step = "WAITING_NAME";

    await ctx.reply(
      "✅ Rasm qabul qilindi!\n\n" +
      "✏️ <b>2-qadam:</b> Endi ushbu dorining <b>nomini</b> kiriting:",
      {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [[{ text: "❌ Bekor qilish" }]],
          resize_keyboard: true,
        },
      }
    );
  });

  // Handle text messages based on step
  bot.on("message:text", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const text = ctx.message.text.trim();
    if (text === "❌ Bekor qilish") return;

    const session = getSession(userId);

    // If waiting for photo, warn them
    if (session.step === "WAITING_PHOTO") {
      await ctx.reply("⚠️ Iltimos, avval dorining <b>rasmini</b> yuboring:", { parse_mode: "HTML" });
      return;
    }

    // Waiting for name
    if (session.step === "WAITING_NAME") {
      session.name = text;
      session.step = "WAITING_UNIT";

      await ctx.reply(
        `Dori nomi: <b>${session.name}</b>\n\n` +
        `📦 <b>3-qadam:</b> O'lchov birligi yoki turini tanlang:`,
        {
          parse_mode: "HTML",
          ...UNIT_KEYBOARD,
        }
      );
      return;
    }

    // Waiting for unit
    if (session.step === "WAITING_UNIT") {
      // Clean up emoji if present
      const cleanUnit = text.replace(/^[^\w\sа-яА-ЯёЁ]+/, "").trim();
      session.unit = cleanUnit || text;
      session.step = "WAITING_QUANTITY";

      await ctx.reply(
        `Tanlangan birlik: <b>${session.unit}</b>\n\n` +
        `🔢 <b>4-qadam:</b> Miqdorini kiriting (masalan: 1, 2.5, 500, 10):`,
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [[{ text: "❌ Bekor qilish" }]],
            resize_keyboard: true,
          },
        }
      );
      return;
    }

    // Waiting for quantity
    if (session.step === "WAITING_QUANTITY") {
      session.quantity = text;
      session.step = "CONFIRM";

      const summaryText =
        `📋 <b>Kiritilgan dori ma'lumotlari:</b>\n\n` +
        `💊 <b>Nomi:</b> ${session.name}\n` +
        `📦 <b>Turi / Birligi:</b> ${session.unit}\n` +
        `🔢 <b>Miqdori:</b> ${session.quantity}\n` +
        `🆔 <b>Sizning Telegram ID:</b> <code>${userId}</code>\n\n` +
        `Ma'lumotlar to'g'rimi? Saqlash uchun quyidagi tugmani bosing:`;

      if (session.photo_file_id) {
        await ctx.replyWithPhoto(session.photo_file_id, {
          caption: summaryText,
          parse_mode: "HTML",
          ...CONFIRM_KEYBOARD(),
        });
      } else {
        await ctx.reply(summaryText, {
          parse_mode: "HTML",
          ...CONFIRM_KEYBOARD(),
        });
      }
      return;
    }

    // Default message when not in flow
    if (session.step === "IDLE") {
      await ctx.reply(
        "Dori qo'shish uchun quyidagi <b>➕ Dori qo'shish</b> tugmasini bosing:",
        {
          parse_mode: "HTML",
          ...MAIN_KEYBOARD,
        }
      );
    }
  });

  // Handle callback queries (Inline buttons)
  bot.on("callback_query:data", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const data = ctx.callbackQuery.data;
    const session = getSession(userId);

    if (data === "confirm_save") {
      if (!session.name || !session.unit || !session.quantity || !session.photo_file_id) {
        await ctx.answerCallbackQuery({ text: "Ma'lumotlar to'liq emas yoki muddati o'tgan." });
        await ctx.reply("Iltimos, dori qo'shishni boshidan boshlang.", MAIN_KEYBOARD);
        clearSession(userId);
        return;
      }

      await ctx.answerCallbackQuery({ text: "Saqlanmoqda..." });

      try {
        const username = ctx.from?.username || ctx.from?.first_name || null;
        const saved = await createMedicine({
          telegram_user_id: userId,
          telegram_username: username,
          name: session.name,
          unit: session.unit,
          quantity: session.quantity,
          photo_file_id: session.photo_file_id,
        });

        clearSession(userId);

        await ctx.editMessageCaption({
          caption:
            `✅ <b>Muvaffaqiyatli saqlandi!</b>\n\n` +
            `💊 <b>Dori:</b> ${saved.name}\n` +
            `📊 <b>Miqdor:</b> ${saved.quantity} ${saved.unit}\n` +
            `🆔 <b>ID raqami:</b> #${saved.id}\n\n` +
            `Ushbu ma'lumotlar Admin Panelga to'liq tushdi!`,
          parse_mode: "HTML",
        });

        await ctx.reply("Yana dori qo'shish uchun quyidagi tugmani bosing:", MAIN_KEYBOARD);
      } catch (err) {
        console.error("Dori saqlashda xato:", err);
        await ctx.reply("❌ Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.", MAIN_KEYBOARD);
      }
    } else if (data === "cancel_save") {
      clearSession(userId);
      await ctx.answerCallbackQuery({ text: "Bekor qilindi" });
      await ctx.reply("❌ Saqlash bekor qilindi.", MAIN_KEYBOARD);
    }
  });
}

