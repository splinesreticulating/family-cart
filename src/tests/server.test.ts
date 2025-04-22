import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import db from '../db';
import Database from 'better-sqlite3';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

// Use a test database
const TEST_DB = 'test-items.db';

// Ensure we're using the test database
process.env.NODE_ENV = 'test';

// Close any existing connection and remove the test database if it exists
db.close();
if (existsSync(TEST_DB)) {
  await unlink(TEST_DB);
}

// Create a fresh test database and update the module's db instance
const testDb = new Database(TEST_DB);
testDb.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    checked INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Replace the db instance in the server
const serverModule = await import('../server');
Object.defineProperty(serverModule, 'db', {
  value: testDb,
  writable: true,
  configurable: true
});

describe('FamilyCart API', () => {
  // Clear the database before each test
  beforeEach(() => {
    testDb.prepare('DELETE FROM items').run();
  });

  // Clean up test database after all tests
  afterAll(async () => {
    testDb.close();
    if (existsSync(TEST_DB)) {
      await unlink(TEST_DB);
    }
  });

  describe('GET /items', () => {
    it('should return an empty array when no items exist', async () => {
      const response = await request(app).get('/items');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all items in the database', async () => {
      const testItem = { name: 'Test Item' };
      const inserted = await request(app).post('/items').send(testItem);
      
      const response = await request(app).get('/items');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe(testItem.name);
      expect(response.body[0].id).toBe(inserted.body.id);
    });
  });

  describe('POST /items', () => {
    it('should create a new item', async () => {
      const testItem = { name: 'Test Item' };
      const response = await request(app).post('/items').send(testItem);
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(testItem.name);
      expect(response.body.id).toBeDefined();
    });

    it('should reject items without a name', async () => {
      const response = await request(app).post('/items').send({});
      expect(response.status).toBe(400);
    });
  });

  describe('PUT /items/:id', () => {
    it('should update an existing item', async () => {
      // Create an item first
      const createResponse = await request(app)
        .post('/items')
        .send({ name: 'Original Name' });
      
      const updateResponse = await request(app)
        .put(`/items/${createResponse.body.id}`)
        .send({ name: 'Updated Name' });
      
      expect(updateResponse.status).toBe(204);

      // Verify the update
      const getResponse = await request(app).get('/items');
      expect(getResponse.body[0].name).toBe('Updated Name');
    });
  });

  describe('DELETE /items/:id', () => {
    it('should delete an existing item', async () => {
      // Create an item first
      const createResponse = await request(app)
        .post('/items')
        .send({ name: 'To Be Deleted' });
      
      const deleteResponse = await request(app)
        .delete(`/items/${createResponse.body.id}`);
      
      expect(deleteResponse.status).toBe(204);

      // Verify the deletion
      const getResponse = await request(app).get('/items');
      expect(getResponse.body).toHaveLength(0);
    });
  });

  describe('POST /items/:id/toggle', () => {
    it('should toggle the checked status of an item', async () => {
      // Create an item first
      const createResponse = await request(app)
        .post('/items')
        .send({ name: 'Toggle Test' });
      
      // Toggle the item
      const toggleResponse = await request(app)
        .post(`/items/${createResponse.body.id}/toggle`);
      
      expect(toggleResponse.status).toBe(204);

      // Verify the toggle
      const getResponse = await request(app).get('/items');
      expect(getResponse.body[0].checked).toBe(1);
    });
  });
});
