export const MAIN_KEYBOARD = {
  reply_markup: {
    keyboard: [
      [{ text: "➕ Dori qo'shish" }],
      [{ text: "📋 Oxirgi qo'shilganlar" }, { text: "ℹ️ Yordam" }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  }
};

export const UNIT_KEYBOARD = {
  reply_markup: {
    keyboard: [
      [{ text: "🧴 Litr" }, { text: "🧪 ml" }],
      [{ text: "⚖️ kg" }, { text: "⚖️ Gramm" }],
      [{ text: "💊 Dona" }, { text: "📦 Boshqa" }],
      [{ text: "❌ Bekor qilish" }]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

export const CONFIRM_KEYBOARD = (medicineId?: string) => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: "✅ Saqlash", callback_data: "confirm_save" },
        { text: "❌ Bekor qilish", callback_data: "cancel_save" }
      ]
    ]
  }
});

