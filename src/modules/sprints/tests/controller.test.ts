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