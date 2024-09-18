import supertest from 'supertest'
import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import createApp from '@/app'

const db = await createTestDatabase()

const app = createApp(db)
const createTemplate = createFor(db, 'templates')

describe('GET /templates happy path', () => {
  beforeAll(async () => {
    await createTemplate([
      { text: 'congratulations1!' },
      { text: 'congratulations2!' },
      { text: 'congratulations3!' },
    ])
  })

  test('should respond with a 200 status code', async () => {
    const response = await supertest(app).get('/templates')
    expect(response.statusCode).toBe(200)
  })

  test('should respond with a json', async () => {
    const response = await supertest(app).get('/templates')
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
  })

  test('should get all templates', async () => {
    const response = await supertest(app).get('/templates')
    expect(response.body).toHaveLength(3)
  })

  test('should get template by template id', async () => {
    const response = await supertest(app).get('/templates?id=1')
    expect(response.body).toHaveLength(1)
  })

  test('should limit amount of templates', async () => {
    const response = await supertest(app).get('/templates?limit=1')
    expect(response.body).toHaveLength(1)
  })

  test('should work both, id and limit', async () => {
    const response = await supertest(app).get('/templates?limit=5&id=1')
    expect(response.body).toHaveLength(1)
  })

  test('should respond with an error if id is wrong format', async () => {
    const response = await supertest(app).get('/templates?id=cat')
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBeTruthy()
  })

  afterAll(async () => {
    await db.deleteFrom('templates').execute()
  })
})

// sad path tests
describe('GET /templates sad path', () => {
  test('should respond with a 400 status code if there are no templates', async () => {
    const response = await supertest(app).get('/templates')
    expect(response.statusCode).toBe(400)
  })

  test('should respond with a json error message', async () => {
    const response = await supertest(app).get('/templates')
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.body).toHaveProperty('error', 'No templates found')
  })
})
