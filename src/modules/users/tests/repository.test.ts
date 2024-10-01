import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import cleanDatabase from '@tests/utils/createTestDatabase/cleanDatabase'
import buildRepository, { UsersRepository } from '../repository'

const db = await createTestDatabase()

const repository: UsersRepository = buildRepository(db)
const createUsers = createFor(db, 'users')

beforeAll(async () => {
  await cleanDatabase(db)
  await createUsers([
    { id: '123', username: 'User1' },
    { id: '345', username: 'User2' },
    { id: '657', username: 'User3' },
  ])
})

describe('Queries for template table', () => {
  test('should get all users', async () => {
    const allTUsers = await repository.getUsers()
    expect(allTUsers.length).toBe(3)
  })

  test('should find user by username', async () => {
    const username = 'User1'
    const userByUsername = await repository.getUserByUsername(username)
    const expectedUser = { id: '123', username: 'User1' }
    expect(userByUsername).toEqual(expectedUser)
  })

  test('should return undefined if user is not found', async () => {
    const invalidUsername = 'Pong'
    const userByUsername = await repository.getUserByUsername(invalidUsername)
    expect(userByUsername).toEqual(undefined)
  })

  test('should add new user', async () => {
    const newUser = { id: '999', username: 'newUser' }
    const user = await repository.insertUser(newUser)
    const allUsers = await repository.getUsers()
    expect(allUsers.length).toBe(4)
    expect(user).toEqual(newUser)
  })

  test('should delete user', async () => {
    const userId = '123'
    const deletedUser = await repository.deleteUser(userId)
    const allUsers = await repository.getUsers()
    expect(allUsers.length).toBe(3)
    expect(deletedUser).toHaveProperty('numDeletedRows')
  })
})

afterAll(async () => {
  await cleanDatabase(db)
})
