import Tesseract from 'tesseract.js';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import express from 'express';
import multer from 'multer';
import db from './db.js';
import path from 'path';
import cors from 'cors';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serve index.html and assets

// CRUD endpoints
app.get('/items', (req, res) => {
  const items = db.prepare('SELECT * FROM items ORDER BY created_at').all();
  res.json(items);
});

app.post('/items', (req, res) => {
  const { name } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO items (id, name) VALUES (?, ?)').run(id, name);
  res.status(201).json({ id, name });
});

app.post('/items/:id/toggle', (req, res) => {
  db.prepare('UPDATE items SET checked = NOT checked WHERE id = ?').run(req.params.id);
  res.sendStatus(204);
});

app.delete('/items/:id', (req, res) => {
  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  res.sendStatus(204);
});

app.put('/items/:id', (req, res) => {
  const { name } = req.body;
  db.prepare('UPDATE items SET name = ? WHERE id = ?').run(name, req.params.id);
  res.sendStatus(204);
});

// OCR upload
app.post('/upload', upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file || !('buffer' in req.file)) {
      res.status(400).json({ error: 'No file uploaded or missing buffer property.' });
    }
    const { buffer } = req.file as Express.Multer.File;
    const result = await Tesseract.recognize(buffer, 'eng');

    const lines = result.data.text
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    const insert = db.prepare('INSERT INTO items (id, name) VALUES (?, ?)');
    for (const name of lines) {
      insert.run(uuidv4(), name);
    }

    res.status(200).json({ success: true, itemsAdded: lines.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OCR failed' });
  }
});

// serve fallback index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
  console.log('✅ FamilyCart is running at http://localhost:3000');
});
