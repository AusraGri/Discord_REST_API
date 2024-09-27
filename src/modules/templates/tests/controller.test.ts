import supertest from 'supertest'
import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import cleanDatabase from '@tests/utils/createTestDatabase/cleanDatabase'
import createApp from '@/app'

const db = await createTestDatabase()

const app = createApp(db)
const createTemplate = createFor(db, 'templates')

describe('GET /templates happy path', () => {
  let templateId: number

  beforeAll(async () => {
    await cleanDatabase(db)
    const [template] = await createTemplate([
      { text: 'congratulations1!' },
      { text: 'congratulations2!' },
      { text: 'congratulations3!' },
    ])
    templateId = template.id
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
    const id = { id: templateId }
    const response = await supertest(app).get('/templates').query(id)
    expect(response.body).toHaveLength(1)
  })

  test('should limit amount of templates', async () => {
    const limit = { limit: 2 }
    const response = await supertest(app).get('/templates').query(limit)
    expect(response.body).toHaveLength(2)
  })

  test('should work both, id and limit', async () => {
    const query = { limit: 2, id: templateId }
    const response = await supertest(app).get('/templates').query(query)
    expect(response.body).toHaveLength(1)
  })

  test('should respond with an error if id is wrong format', async () => {
    const query = { id: 'cat' }
    const response = await supertest(app).get('/templates').query(query)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBeTruthy()
  })

  afterAll(async () => {
    await cleanDatabase(db)
  })
})

describe('GET /templates sad path', () => {
  test('should respond with a 404 status code if there are no templates', async () => {
    const response = await supertest(app).get('/templates')
    expect(response.statusCode).toBe(404)
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
    valid: { text: 'Congratulations to {username} who finished {sprint}!' },
    invalid: { text: 'Congratulations to someone who finished some sprint!' },
    noText: { text: '' },
  }

  test('should respond with a 201 status code after saving valid template', async () => {
    const response = await supertest(app)
      .post('/templates')
      .send(templates.valid)
    expect(response.statusCode).toBe(201)
  })

  test('should respond with a json message', async () => {
    const response = await supertest(app)
      .post('/templates')
      .send(templates.valid)
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.body).toHaveProperty(
      'text',
      'Congratulations to {username} who finished {sprint}!'
    )
    expect(response.body).toHaveProperty('id')
  })

  test('should respond with a 400 status code if template text is invalid', async () => {
    const response = await supertest(app)
      .post('/templates')
      .send(templates.invalid)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  test('should respond with a 400 status code if template text is invalid', async () => {
    const response = await supertest(app)
      .post('/templates')
      .send(templates.noText)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  test('should respond with a 400 status code if no data is provided', async () => {
    const response = await supertest(app).post('/templates')
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  afterAll(async () => {
    await cleanDatabase(db)
  })
})

describe('PATCH /templates', () => {
  let templateId: number
  const updateTemplate = {
    text: 'congratulations {username} for {sprint} is updated!',
  }
  const invalidId = 'cat'
  const invalidIdNumber = 1000

  beforeAll(async () => {
    await cleanDatabase(db)
    const [template] = await createTemplate([
      { text: 'congratulations {username} for {sprint}!' },
    ])
    templateId = template.id
  })

  test('should respond with a 200 status after updating template', async () => {
    const response = await supertest(app)
      .patch(`/templates/${templateId}`)
      .send(updateTemplate)

    expect(response.statusCode).toBe(200)
  })

  test('should respond with a 400 status if template id is invalid', async () => {
    const response = await supertest(app)
      .patch(`/templates/${invalidId}`)
      .send(updateTemplate)

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message', 'Validation error')
  })

  test('should respond with a 404 status if template id does not exist', async () => {
    const response = await supertest(app)
      .patch(`/templates/${invalidIdNumber}`)
      .send(updateTemplate)

    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message', 'No template found')
  })

  test('should respond with a json message of new updated template', async () => {
    const response = await supertest(app)
      .patch(`/templates/${templateId}`)
      .send(updateTemplate)
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.body).toHaveProperty(
      'text',
      'congratulations {username} for {sprint} is updated!'
    )
    expect(response.body).toHaveProperty('id', 1)
  })

  afterAll(async () => {
    await cleanDatabase(db)
  })
})

// test for delete endpoint
describe('DELETE /templates ', () => {
  let templateId: number

  beforeAll(async () => {
    const [template] = await createTemplate([
      { text: 'congratulations {username} for {sprint}!' },
    ])
    templateId = template.id
  })

  test('should respond with a 200 status code and message when deleted successfully', async () => {
    const response = await supertest(app).delete(`/templates/${templateId}`)
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty(
      'message',
      'Template deleted successfully'
    )
  })

  test('should respond with a 400 status code when template id is invalid', async () => {
    const invalidId = 0
    const response = await supertest(app).delete(`/templates/${invalidId}`)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message', 'Validation error')
  })

  test('should respond with a 400 status code when template id is not found', async () => {
    const invalidId = 1
    const response = await supertest(app).delete(`/templates/${invalidId}`)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message', 'Invalid template id')
  })

  afterAll(async () => {
    await cleanDatabase(db)
  })
})
