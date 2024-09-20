import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import buildRepository from '../repository'
import * as fixtures from './fixtures'

const db = await createTestDatabase()

const repository = buildRepository(db)
const createSprint = createFor(db, 'sprints')
const createMessages = createFor(db, 'messages')
const createUser = createFor(db, 'users')
const createTemplate = createFor(db, 'templates')

beforeAll(async () => {
  await db.deleteFrom('messages').execute()
  await db.deleteFrom('users').execute()
  await db.deleteFrom('sprints').execute()
  await db.deleteFrom('templates').execute()
  await createSprint(fixtures.sprints)
  await createTemplate(fixtures.templates)
  await createUser(fixtures.users)
  await createMessages(fixtures.messages)
})

describe('Queries for messages table', () => {

  test('should get all messages', async () => {
    const allMessages = await repository.getMessages()

    expect(allMessages.length).toBe(3)
  })

  test('should get all messages and limit results', async () => {
    const allMessages = await repository.getMessages({limit: 1})

    expect(allMessages.length).toBe(1)
  })

  test('should find messages by user id', async () => {
    const messagesByUsername = await repository.getMessages({username: 'Bob'})
    expect(messagesByUsername.length).toBe(2)
  })

  test('should find messages by sprint code', async () => {
    const messagesBySprintId = await repository.getMessages({sprintCode:'WD-1.1'})
    expect(messagesBySprintId.length).toBe(2)
  })

  test('should find messages by sprint code, username and apply limit', async () => {
    const messagesBySprintId = await repository.getMessages({sprintCode:'WD-1.1', username: 'Bob', limit: 1})
    expect(messagesBySprintId.length).toBe(1)
  })
})

afterAll(async () => {
  await db.deleteFrom('messages').execute()
  await db.deleteFrom('users').execute()
  await db.deleteFrom('sprints').execute()
  await db.deleteFrom('templates').execute()
})
