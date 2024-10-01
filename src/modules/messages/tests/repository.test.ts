import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import cleanDatabase from '@tests/utils/createTestDatabase/cleanDatabase'
import buildRepository from '../repository'
import * as fixtures from './fixtures'

const db = await createTestDatabase()

const repository = buildRepository(db)
const createSprint = createFor(db, 'sprints')
const createMessages = createFor(db, 'messages')
const createUser = createFor(db, 'users')
const createTemplate = createFor(db, 'templates')

beforeAll(async () => {
  await cleanDatabase(db)
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
    const allMessages = await repository.getMessages({ limit: 1 })

    expect(allMessages.length).toBe(1)
  })

  test('should find messages by username', async () => {
    const messagesByUsername = await repository.getMessages({ username: 'Bob' })
    expect(messagesByUsername.length).toBe(2)
  })

  test('should find messages by sprint code', async () => {
    const messagesBySprintId = await repository.getMessages({
      sprintCode: 'WD-1.1',
    })
    expect(messagesBySprintId.length).toBe(2)
  })

  test('should find messages by sprint code, username and apply limit', async () => {
    const messagesBySprintId = await repository.getMessages({
      sprintCode: 'WD-1.1',
      username: 'Bob',
      limit: 1,
    })
    expect(messagesBySprintId.length).toBe(1)
  })

  test('should insert new message', async () => {
    const newMessage = {
      gifUrl: 'url',
      originalMessage: 'original message',
      sprintCode: 'WD-1.1',
      sprintId: 1,
      sprintTitle: 'Full sprint title',
      templateId: 1,
      templateText: 'template text',
      username: 'Bob',
    }
    const newAddedMessage = await repository.insertMessage(newMessage)
    const allMessages = await repository.getMessages()
    expect(allMessages.length).toBe(4)
    expect(newAddedMessage).toHaveProperty(
      'originalMessage',
      'original message'
    )
  })
})

afterAll(async () => {
  await cleanDatabase(db)
})
