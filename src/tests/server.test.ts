import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import db from '../db'
import { app } from '../server'

// Ensure we're using the test database
process.env.NODE_ENV = 'test'

describe('FamilyCart API', () => {
    // Clear the database before each test
    beforeEach(() => {
        db.prepare('DELETE FROM items').run()
    })

    describe('GET /items', () => {
        it('should return an empty array when no items exist', async () => {
            const response = await request(app).get('/items')
            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })

        it('should return all items in the database', async () => {
            const testItem = { name: 'Test Item' }
            const inserted = await request(app).post('/items').send(testItem)

            const response = await request(app).get('/items')
            expect(response.status).toBe(200)
            expect(response.body).toHaveLength(1)
            expect(response.body[0].name).toBe(testItem.name)
            expect(response.body[0].id).toBe(inserted.body.id)
        })
    })

    describe('POST /items', () => {
        it('should create a new item', async () => {
            const testItem = { name: 'Test Item' }
            const response = await request(app).post('/items').send(testItem)

            expect(response.status).toBe(201)
            expect(response.body.name).toBe(testItem.name)
            expect(response.body.id).toBeDefined()
        })

        it('should reject items without a name', async () => {
            const response = await request(app).post('/items').send({})
            expect(response.status).toBe(400)
        })
    })

    describe('PUT /items/:id', () => {
        it('should update an existing item', async () => {
            // Create an item first
            const createResponse = await request(app).post('/items').send({ name: 'Original Name' })

            const updateResponse = await request(app)
                .put(`/items/${createResponse.body.id}`)
                .send({ name: 'Updated Name' })

            expect(updateResponse.status).toBe(204)

            // Verify the update
            const getResponse = await request(app).get('/items')
            expect(getResponse.body[0].name).toBe('Updated Name')
        })

        it('should return 404 when updating non-existent item', async () => {
            const updateResponse = await request(app)
                .put('/items/non-existent-id')
                .send({ name: 'Updated Name' })

            expect(updateResponse.status).toBe(404)
        })
    })

    describe('DELETE /items/:id', () => {
        it('should delete an existing item', async () => {
            // Create an item first
            const createResponse = await request(app).post('/items').send({ name: 'To Be Deleted' })

            const deleteResponse = await request(app).delete(`/items/${createResponse.body.id}`)

            expect(deleteResponse.status).toBe(204)

            // Verify the deletion
            const getResponse = await request(app).get('/items')
            expect(getResponse.body).toHaveLength(0)
        })

        it('should return 404 when deleting non-existent item', async () => {
            const deleteResponse = await request(app).delete('/items/non-existent-id')
            expect(deleteResponse.status).toBe(404)
        })
    })
})
