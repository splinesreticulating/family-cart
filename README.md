# FamilyCart

**FamilyCart** is a simple, mobile-first grocery list app for your family. You can:

- ✅ Add, edit, and delete items on a shared grocery list
- 🖼️ Upload DoorDash screenshots — the app will OCR the image and extract items automatically (Tesseract.js)
- 🧠 All data is stored locally using SQLite
- ⚡ Runs entirely on one port with zero external services

---

## 🗂 Folder Structure
```
    family-cart/
    ├── src/                 # TypeScript source files and frontend assets
    │   ├── server.ts        # Express backend (ESM)
    │   ├── db.ts            # SQLite DB init
    │   ├── index.html       # Frontend entry point
    │   ├── styles.css       # Styles
    │   └── app.js           # Minimal Alpine.js interactivity
    ├── dist/                # Compiled output for deployment
    ├── familycart.db        # Local SQLite DB (auto-created)
    ├── package.json         # Scripts & dependencies
    ├── tsconfig.json        # TypeScript config
```
---

## 🚀 Requirements

- Node.js **v18+** (tested with v21 on Raspberry Pi)
- npm
- For Pi: `build-essential`, `g++`, `make`, and `python3` to compile `better-sqlite3`

---

## 🔧 Local Development

- git clone https://github.com/splinesreticulating/family-cart.git
- cd family-cart
- npm install
- npm run dev

Then open your browser to  `http://localhost:3000`

---

## 🏗 Production Build (e.g. Raspberry Pi)

- npm run build
- NODE_ENV=production npm start

This compiles the backend and copies static assets (`index.html`, `styles.css`, `app.js`) to `dist/`. The app runs from `dist/server.js`.

> If running on a Raspberry Pi, be sure to run `npm rebuild better-sqlite3` after install so it compiles natively for your architecture.

---

## ✨ Notes

- 🧠 OCR runs entirely in-memory (Tesseract.js)
- 🧘 Uses Alpine.js instead of a heavyweight frontend framework
- 🐢 Runs great on lightweight hardware like Raspberry Pi Zero or 3/4
- 🤝 Perfect for families sharing the same Wi-Fi
