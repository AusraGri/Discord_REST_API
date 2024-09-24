import supertest from 'supertest'
import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import cleanDatabase from '@tests/utils/createTestDatabase/cleanDatabase'
import createApp from '@/app'
import * as fixtures from './fixtures'

const db = await createTestDatabase()

const app = createApp(db)
const createMessages = createFor(db, 'messages')
const createUser = createFor(db, 'users')
const createTemplate = createFor(db, 'templates')
const createSprints = createFor(db, 'sprints')

beforeAll(async () => {
  await cleanDatabase(db)
  await createSprints(fixtures.sprints)
  await createTemplate(fixtures.templates)
  await createUser(fixtures.users)
  await createMessages(fixtures.messages)
})

describe('GET /messages', () => {
  test('should respond with a 200 status code', async () => {
    const response = await supertest(app).get('/messages')
    expect(response.statusCode).toBe(200)
  })

  test('should respond with a list of all congratulatory messages when no sprint id or user id is given', async () => {
    const response = await supertest(app).get('/messages')
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.body).toHaveLength(3)
    expect(response.body[0]).toHaveProperty('gifUrl', 'some url')
    expect(response.body[0]).toHaveProperty(
      'originalMessage',
      'congratulations!'
    )
  })

  test('should respond with a list of messages by sprint', async () => {
    const query = { sprint: 'WD-1.1' }
    const response = await supertest(app).get('/messages').query(query)
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.body).toHaveLength(2)
    expect(response.body[0]).toHaveProperty('gifUrl', 'some url')
    expect(response.body[0]).toHaveProperty(
      'originalMessage',
      'congratulations!'
    )
    expect(response.body[0]).toHaveProperty('sprintCode', 'WD-1.1')
  })

  test('should respond with a list of messages by username', async () => {
    const query = { username: 'Bob' }
    const response = await supertest(app).get('/messages').query(query)
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.body).toHaveLength(2)
  })

  test('should respond with an error if username is not found', async () => {
    const badUser = { username: 'John' }
    const response = await supertest(app).get('/messages').query(badUser)
    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message', 'No messages found')
  })

  test('should respond with a list of messages by username and sprint', async () => {
    const query = { username: 'Bob', sprint: 'WD-1.1' }
    const response = await supertest(app).get('/messages').query(query)
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.body).toHaveLength(1)
  })
})

afterAll(async () => {
  await cleanDatabase(db)
})
