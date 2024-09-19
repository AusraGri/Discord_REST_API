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
    const query = {id: 'cat'}
    const response = await supertest(app).get('/templates').query(query)
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
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message', 'No templates found')
  })
})

describe('POST /templates', () => {

  const templates = {
    valid: {text: 'Congratulations to {username} who finished {sprint}!'},
    invalid: {text: 'Congratulations to someone who finished some sprint!'},
    noText: {text: ''},
  }

  test('should respond with a 201 status code', async () => {
    const response = await supertest(app).post('/templates').send(templates.valid)
    expect(response.statusCode).toBe(201)
  })

  test('should respond with a json message', async () => {
    const response = await supertest(app).post('/templates').send(templates.valid)
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.body).toHaveProperty('text', 'Congratulations to {username} who finished {sprint}!')
    expect(response.body).toHaveProperty('id')
  })

  test('should respond with a 400 status code if template text is invalid', async () => {
    const response = await supertest(app).post('/templates').send(templates.invalid)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  test('should respond with a 400 status code if template text is invalid', async () => {
    const response = await supertest(app).post('/templates').send(templates.noText)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  test('should respond with a 400 status code if no data is provided', async () => {
    const response = await supertest(app).post('/templates')
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  afterAll(async () => {
    await db.deleteFrom('templates').execute()
  })
})


describe('PATCH /templates', () => {
  let templateId: number

  beforeAll(async () => {
    const [template] = await createTemplate([
      { text: 'congratulations {username} for {sprint}!' },
    ])
    templateId = template.id
  })

  test('should respond with a 201 status after updating template', async () => {
    const updateTemplate = {id: templateId, text: 'congratulations {username} for {sprint} is updated!'}
    const response = await supertest(app).patch('/templates').send(updateTemplate)
    expect(response.statusCode).toBe(200)
  })

  test('should respond with a 400 status if template id is invalid', async () => {
    const updateTemplate = {id: 'cat', text: 'congratulations {username} for {sprint} is updated!'}
    const response = await supertest(app).patch('/templates').send(updateTemplate)
    expect(response.statusCode).toBe(400)
  })

  test('should respond with a json message of new updated template', async () => {
    const updateTemplate = {id: templateId, text: 'congratulations {username} for {sprint} is updated!'}
    const response = await supertest(app).patch('/templates').send(updateTemplate)
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.body).toHaveProperty('text', 'congratulations {username} for {sprint} is updated!')
  })

  afterAll(async () => {
    await db.deleteFrom('templates').execute()
  })
})