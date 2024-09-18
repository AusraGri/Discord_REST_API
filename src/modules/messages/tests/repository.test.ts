import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import buildRepository from '../repository'


const db = await createTestDatabase()

const repository = buildRepository(db)
const createMessages = createFor(db, 'messages')
const createUser = createFor(db, 'users')
const createTemplate = createFor(db, 'templates')

beforeAll(async () => {

    await createTemplate([{text: 'congratulations!'}])
    await createUser([
        {
          username: "Bob"
        },
      ])
      await createMessages([
        {
          gifUrl: 'some url',
          originalMessage: 'congratulations',
          sprintId: 'WD-1.1',
          templateId: 1,
          userId: 1
        },
      ])
})

describe('GET /messages', () => {
  test('should get all messages', async () => {
    const allMessages = await repository.findAll()

    expect(allMessages.length).toBe(1)
  })

  test('should find messages by user id', async () => {
   const messagesByUsername = await repository.findByUsername('Bob')
   expect(messagesByUsername.length).toBe(1)
  })

  test('should find messages by sprint id', async () => {
   const messagesBySprintId = await repository.findBySprint('WD-1.1')
   expect(messagesBySprintId.length).toBe(1)
  })
})

afterAll(async () => {
    await db.deleteFrom('messages').execute();
    await db.deleteFrom('users').execute();
    await db.deleteFrom('sprints').execute();
    await db.deleteFrom('templates').execute();
  });