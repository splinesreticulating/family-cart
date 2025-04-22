# 🍌 FamilyCart

**FamilyCart** is a dead-simple, mobile-first grocery list app for your family. You can:

- ✅ Add, edit, and delete items on a shared grocery list
- 📸 Upload DoorDash screenshots — the app will OCR the image and extract items automatically
- 💾 All data is stored locally using SQLite
- ⚡ Runs entirely on one port with no build step

---

## 📁 Folder Structure

```
familycart/
├── index.html       # The entire frontend (Alpine.js)
├── server.ts        # Express backend (TypeScript + ESM)
├── db.ts            # SQLite setup
├── familycart.db    # SQLite database (created automatically)
├── package.json     # NPM dependencies + scripts
├── tsconfig.json    # TypeScript config
```

---

## 🧰 Requirements

- Node.js 18+
- npm

---

## 🚀 Installation & Setup

### 1. Clone the repo

```bash
git clone https://github.com/splinesreticulating/family-cart.git
cd family-cart
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
npx tsx server.ts
```

Then open your browser to:

```
http://localhost:3000
```

---

## ✨ Notes

- This app uses Alpine.js instead of a frontend framework like Svelte or React for simplicity
- Screenshots are never saved — OCR is done entirely in-memory
- Perfect for sharing between family members on the same Wi-Fi

