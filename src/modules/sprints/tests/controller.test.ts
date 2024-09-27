import supertest from 'supertest'
import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import cleanDatabase from '@tests/utils/createTestDatabase/cleanDatabase'
import createApp from '@/app'
import * as fixtures from './fixtures'
import { SprintSelect } from '../repository'

const db = await createTestDatabase()

const app = createApp(db)
const createSprints = createFor(db, 'sprints')

describe('GET /sprints happy path', () => {
  let testSprintCode: string
  let expectedSprint: SprintSelect

  beforeAll(async () => {
    await cleanDatabase(db)
    const [sprint] = await createSprints(fixtures.sprints)
    testSprintCode = sprint.sprintCode
    expectedSprint = sprint
  })

  test('should respond with a 200 status code', async () => {
    const response = await supertest(app).get('/sprints')
    expect(response.statusCode).toBe(200)
  })

  test('should respond with a json', async () => {
    const response = await supertest(app).get('/sprints')
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
  })
  test('should get all sprints', async () => {
    const response = await supertest(app).get('/sprints')
    expect(response.body).toHaveLength(3)
  })

  test('should get template by sprint code', async () => {
    const query = { sprintCode: testSprintCode }
    const response = await supertest(app).get('/sprints').query(query)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toEqual(expectedSprint)
  })

  test('should get template by sprint id', async () => {
    const query = { id: expectedSprint.id }
    const response = await supertest(app).get('/sprints').query(query)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toEqual(expectedSprint)
  })

  test('should limit amount of sprints', async () => {
    const limit = { limit: 2 }
    const response = await supertest(app).get('/sprints').query(limit)
    expect(response.body).toHaveLength(2)
  })

  test('should work both, getting sprints by sprint code and limit', async () => {
    const query = { limit: 2, sprintCode: testSprintCode }
    const response = await supertest(app).get('/sprints').query(query)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toEqual(expectedSprint)
  })

  test('should respond with an error if sprint code is wrong format', async () => {
    const query = { sprintCode: 1 }
    const response = await supertest(app).get('/sprints').query(query)
    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBeTruthy()
  })

  test('should respond with an error if sprint code does not exist', async () => {
    const query = { sprintCode: 'cat' }
    const response = await supertest(app).get('/sprints').query(query)
    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBeTruthy()
    expect(response.body.error).toHaveProperty('message', 'No sprints found')
  })

  afterAll(async () => {
    await db.deleteFrom('templates').execute()
  })
})

describe('POST /sprints', () => {
  const sprints = {
    valid: { sprintCode: 'Code-1', fullTitle: 'Sprint full title' },
    invalidCode: { sprintCode: 'C', fullTitle: 'Sprint full title' },
    invalidTitle: { sprintCode: 'Code-2', fullTitle: 'S' },
    noContext: { sprintCode: '', fullTitle: '' },
  }

  beforeAll(async () => {
    await cleanDatabase(db)
  })

  test('should respond with a status code 201 and json message of inserted sprint data', async () => {
    const response = await supertest(app).post('/sprints').send(sprints.valid)

    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.statusCode).toBe(201)

    expect(response.body).toHaveProperty('sprintCode', 'Code-1')
    expect(response.body).toHaveProperty('fullTitle', 'Sprint full title')
    expect(response.body).toHaveProperty('id', 1)
  })

  test('should respond with a 400 status code if sprint code is already in the database', async () => {
    const response = await supertest(app).post('/sprints').send(sprints.valid)

    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  test('should respond with a 400 status code if sprint title is invalid', async () => {
    const response = await supertest(app)
      .post('/sprints')
      .send(sprints.invalidTitle)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  test('should respond with a 400 status code if sprint code is invalid', async () => {
    const response = await supertest(app)
      .post('/sprints')
      .send(sprints.invalidCode)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  test('should respond with a 400 status code if no data is provided', async () => {
    const response = await supertest(app).post('/sprints')
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  afterAll(async () => {
    await cleanDatabase(db)
  })
})

describe('PATCH /sprints', () => {
  let sprintId: number

  const updateSprint = {
    sprintCode: 'Code-updated',
    fullTitle: 'Sprint full title updated',
  }

  beforeAll(async () => {
    await cleanDatabase(db)
    const [sprint] = await createSprints([
      { sprintCode: 'Code-1', fullTitle: 'Sprint full title' },
    ])
    sprintId = sprint.id
  })

  test('should respond with a 200 status after updating sprint and with updated sprint json file', async () => {
    const response = await supertest(app)
      .patch(`/sprints/${sprintId}`)
      .send(updateSprint)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ id: sprintId, ...updateSprint })
  })

  test('should respond with a 400 status if sprint id is invalid', async () => {
    const invalidId = 'cat'
    const response = await supertest(app)
      .patch(`/sprints/${invalidId}`)
      .send(updateSprint)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message', 'Validation error')
  })

  test('should respond with a 400 status if sprint id does not exist', async () => {
    const invalidId = 100
    const response = await supertest(app)
      .patch(`/sprints/${invalidId}`)
      .send(updateSprint)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty(
      'message',
      'No sprint found with id to update'
    )
  })

  afterAll(async () => {
    await cleanDatabase(db)
  })
})

// test for delete endpoint
describe('DELETE /sprints ', () => {
  let sprintId: number

  beforeAll(async () => {
    await cleanDatabase(db)
    const [sprint] = await createSprints([
      { sprintCode: 'Code-1', fullTitle: 'Sprint full title' },
    ])
    sprintId = sprint.id
  })

  test('should respond with a 200 status code and message when deleted successfully', async () => {
    const response = await supertest(app).delete(`/sprints/${sprintId}`)
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty(
      'message',
      'Sprint deleted successfully'
    )
  })

  test('should respond with a 400 status code when sprint id is invalid', async () => {
    const invalidId = 0
    const response = await supertest(app).delete(`/sprints/${invalidId}`)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message', 'Validation error')
  })

  test('should respond with a 404 status code when sprint id is not found', async () => {
    const badId = 12
    const response = await supertest(app).delete(`/sprints/${badId}`)

    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty(
      'message',
      'Sprint with id is not found'
    )
  })

  afterAll(async () => {
    await cleanDatabase(db)
  })
})
