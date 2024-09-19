import supertest from 'supertest'
import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import createApp from '@/app'

const db = await createTestDatabase()

const app = createApp(db)
const createMessages = createFor(db, 'messages')
const createUser = createFor(db, 'users')
const createTemplate = createFor(db, 'templates')

beforeAll(async () => {
  await createTemplate([{ text: 'congratulations!' }])
  await createUser([
    {
      username: 'Bob',
    },
  ])

  await createMessages([
    {
      gifUrl: 'some url',
      originalMessage: 'congratulations!',
      sprintId: 'WD-1.1',
      templateId: 1,
      userId: 1,
    },
    {
      gifUrl: 'some url',
      originalMessage: 'congratulations!',
      sprintId: 'WD-2.1',
      templateId: 1,
      userId: 1,
    },
  ])
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
    expect(response.body).toHaveLength(2)
    expect(response.body[0]).toHaveProperty('gifUrl', 'some url')
    expect(response.body[0]).toHaveProperty(
      'originalMessage',
      'congratulations!'
    )
  })

  test('should respond with a list of messages by sprint', async () => {
    const response = await supertest(app).get('/messages?sprint=WD-1.1')
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toHaveProperty('gifUrl', 'some url')
    expect(response.body[0]).toHaveProperty(
      'originalMessage',
      'congratulations!'
    )
    expect(response.body[0]).toHaveProperty(
      'sprintId',
      'WD-1.1'
    )
  })

  test('should respond with a list of messages by username', async () => {
    const response = await supertest(app).get('/messages?username=Bob')
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.body).toHaveLength(2)
  })

  test('should respond with an error if username is not found', async () => {
    const response = await supertest(app).get('/messages?username=John')
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty(
      'error'
    )
    expect(response.body.error).toHaveProperty(
      'message', 'No messages found'
    )
  })

  test('should respond with a list of messages by username and sprint', async () => {
    const response = await supertest(app).get('/messages?username=Bob&sprint=WD-1.1')
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.body).toHaveLength(1)
  })
})

afterAll(async () => {
  await db.deleteFrom('messages').execute()
  await db.deleteFrom('users').execute()
  await db.deleteFrom('sprints').execute()
  await db.deleteFrom('templates').execute()
})
