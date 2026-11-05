# 💊 BiznesGo — Telegram Dori Hisobi Boti va Admin Paneli

Telegram orqali dorilarning rasmi, nomi, o'lchov birligi (litr, ml, kg, dona) va miqdorini kiritish hamda ularni **Neon PostgreSQL** bazasida saqlab, zamonaviy **Admin Panel**da nazorat qilish tizimi.

---

## 🚀 Texnologiyalar

- **Backend:** Node.js, Express, TypeScript
- **Telegram Bot:** Grammy
- **Ma'lumotlar bazasi:** Neon Serverless PostgreSQL (`pg`)
- **Admin Panel (Frontend):** React 18, Vite, Tailwind CSS, Lucide Icons
- **Deploy:** Render.com (1 ta Web Service ichida Bot + API + Admin Panel)

---

## 📋 Ishlash tartibi (Foydalanuvchi yo'li)

1. Foydalanuvchi Telegram botda `/start` buyrug'ini yuboradi.
2. **➕ Dori qo'shish** tugmasini bosadi.
3. **1-qadam:** Dorining rasmini yuboradi.
4. **2-qadam:** Dorining nomini kiritadi.
5. **3-qadam:** O'lchov birligini tanlaydi (Litr, ml, kg, gramm, dona...).
6. **4-qadam:** Miqdorini kiritadi (masalan: `2.5`, `500`, `10`).
7. **5-qadam:** Barcha ma'lumotlar tekshirilib, **Saqlash** bosilgach, ma'lumotlar avtomatik **Neon PostgreSQL** bazasiga va **Admin Panel**ga tushadi.

---

## 🛠️ Lokal ishga tushirish (Local Development)

### 1. Bog'liqliklarni o'rnatish
```bash
npm install
cd client && npm install && cd ..
```

### 2. `.env` faylini sozlash
`.env.example` dan nusxa olib `.env` yarating:
```env
PORT=3000
BOT_TOKEN=telegram_bot_tokeningiz
DATABASE_URL=postgresql://user:password@ep-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### 3. Loyihani qurish va ishga tushirish
```bash
# Build qilish (ham client, ham server)
npm run build

# Ishga tushirish
npm start
```
Browserda ochish: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Render.com ga deploy qilish rejasi (Qadamma-qadam)

Render.com da bitta bepul (yoki Starter) **Web Service** orqali ham Bot, ham Admin Panel 24/7 ishlaydi:

1. **GitHub Repository ochish:**
   - Ushbu kodni o'zingizning GitHub hisobingizga push qiling (`git push origin main`).

2. **Render.com ga kirish:**
   - [dashboard.render.com](https://dashboard.render.com) ga kiring.
   - **New +** -> **Web Service** tugmasini bosing.
   - O'zingizning GitHub repositoryingizni tanlang (`biznesgo`).

3. **Sozlamalar (Render Settings):**
   - **Name:** `biznesgo`
   - **Region:** Frankfurt (yoki eng yaqini)
   - **Branch:** `main`
   - **Root Directory:** (bo'sh qoldiring)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Environment Variables (Muhim!):**
   Render sahifasida pastroqda **Environment Variables** bo'limiga quyidagilarni kiriting:
   - `BOT_TOKEN` = Sizning @BotFather dan olgan tokeningiz
   - `DATABASE_URL` = Neon PostgreSQL ulanish manzili (Connection string)
   - `NODE_ENV` = `production`

5. **Deploy tugmasini bosing:**
   - Render avtomatik tarzda build qiladi, bot ishga tushadi va sizga berilgan havola orqali Admin Panel ochiladi!
