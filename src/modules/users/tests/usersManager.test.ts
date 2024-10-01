import { Mock } from 'vitest'
import MockDiscordBotService from '@tests/utils/discord'
import usersManager from '../utils/usersManager'
import refreshUsersData from '../utils/refreshUsersData'

const mockedUsersRepository = {
  getUserByUsername: vi.fn(),
}

vi.mock('../repository', () => ({
  default: vi.fn(() => mockedUsersRepository),
}))

vi.mock('../utils/refreshUsersData', () => ({
  default: vi.fn(),
}))

type Database = any
const db: Database = {}
const discordBot = new MockDiscordBotService()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('usersManager', () => {
  const mockedRefreshUsersData = refreshUsersData as Mock

  test('should return the user if found in the database on the first attempt', async () => {
    const mockUser = { id: '1', username: 'user1' }

    mockedUsersRepository.getUserByUsername.mockResolvedValue(mockUser)

    const manager = usersManager(db, discordBot)

    const result = await manager.getUser('user1')

    expect(result).toEqual(mockUser)
    expect(refreshUsersData).not.toHaveBeenCalled()
    expect(mockedUsersRepository.getUserByUsername).toHaveBeenCalledTimes(1)
  })

  test('should refresh data and return the user if not found on the first attempt', async () => {
    const mockUser = { id: '1', username: 'user1' }
    mockedUsersRepository.getUserByUsername
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(mockUser)

    mockedRefreshUsersData.mockResolvedValue(null)

    const manager = usersManager(db, discordBot)

    const result = await manager.getUser('user1')

    expect(result).toEqual(mockUser)
    expect(refreshUsersData).toHaveBeenCalledWith(db, discordBot)
    expect(mockedUsersRepository.getUserByUsername).toHaveBeenCalledTimes(2)
  })

  test('should return undefined if the user is not found even after refreshing', async () => {
    mockedUsersRepository.getUserByUsername
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)

    mockedRefreshUsersData.mockResolvedValue(null)

    const manager = usersManager(db, discordBot)

    const result = await manager.getUser('nonexistentUser')

    expect(result).toBeUndefined()
    expect(refreshUsersData).toHaveBeenCalledWith(db, discordBot)
    expect(mockedUsersRepository.getUserByUsername).toHaveBeenCalledTimes(2)
  })
})
