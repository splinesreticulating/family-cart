import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express, { type Request, type Response, type RequestHandler } from 'express'
import multer from 'multer'
import Tesseract from 'tesseract.js'
import { v4 as uuidv4 } from 'uuid'
import db from './db.js'
import { extractItemsFromOcr } from './ocrExtract.js'

const app = express()
const upload = multer({ storage: multer.memoryStorage() })

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors())
app.use(express.json())
app.use(express.static(__dirname)) // serve index.html and assets

// CRUD endpoints
app.get('/items', ((req: Request, res: Response) => {
    try {
        const items = db.prepare('SELECT * FROM items ORDER BY created_at').all()
        res.json(items)
    } catch (err) {
        res.status(500).json({ error: 'Database error' })
    }
}) as RequestHandler)

app.post('/items', ((req: Request, res: Response) => {
    try {
        const { name } = req.body
        if (!name) {
            return res.status(400).json({ error: 'Name is required' })
        }
        const id = uuidv4()
        db.prepare('INSERT INTO items (id, name) VALUES (?, ?)').run(id, name)
        res.status(201).json({ id, name })
    } catch (err) {
        res.status(500).json({ error: 'Database error' })
    }
}) as RequestHandler)

app.delete('/items/:id', ((req: Request, res: Response) => {
    try {
        const result = db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id)
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Item not found' })
        }
        res.sendStatus(204)
    } catch (err) {
        res.status(500).json({ error: 'Database error' })
    }
}) as RequestHandler)

app.put('/items/:id', ((req: Request, res: Response) => {
    try {
        const { name } = req.body
        const result = db.prepare('UPDATE items SET name = ? WHERE id = ?').run(name, req.params.id)
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Item not found' })
        }
        res.sendStatus(204)
    } catch (err) {
        res.status(500).json({ error: 'Database error' })
    }
}) as RequestHandler)

// OCR upload
app.post('/upload', upload.single('screenshot'), (async (req: Request, res: Response) => {
    try {
        if (!req.file || !('buffer' in req.file)) {
            res.status(400).json({ error: 'No file uploaded or missing buffer property.' })
        }
        const { buffer } = req.file as Express.Multer.File
        const result = await Tesseract.recognize(buffer, 'eng')

        const items = extractItemsFromOcr(result.data.text)

        const insert = db.prepare('INSERT INTO items (id, name) VALUES (?, ?)')
        for (const name of items) {
            insert.run(uuidv4(), name)
        }

        res.status(200).json({ success: true, itemsAdded: items.length, items })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'OCR failed' })
    }
}) as RequestHandler)

// serve fallback index.html
app.get('*', ((req: Request, res: Response) => {
    try {
        res.sendFile(path.join(__dirname, 'index.html'))
    } catch (err) {
        res.status(500).json({ error: 'File not found' })
    }
}) as RequestHandler)

// Only start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(3000, () => {
        console.log('✅ FamilyCart is running at http://localhost:3000')
    })
}

export { app, db }
