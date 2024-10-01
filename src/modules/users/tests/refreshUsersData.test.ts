import MockDiscordBotService from '@tests/utils/discord'
import refreshUsersData from '../utils/refreshUsersData'

const mockedUsersRepository = {
  getUsers: vi.fn(),
  insertUser: vi.fn(),
  deleteUser: vi.fn(),
}

vi.mock('../repository', () => ({
  default: vi.fn(() => mockedUsersRepository),
}))

type Database = any
const db: Database = {}
const discordBot = new MockDiscordBotService()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('refreshUsersData', () => {
  test('should remove users not in Discord and add new ones from Discord', async () => {
    const discordUsers = [
      { id: '1', username: 'user1' },
      { id: '3', username: 'user3' },
    ]

    const databaseUsers = [
      { id: '1', username: 'user1' },
      { id: '2', username: 'user2' },
    ]

    vi.spyOn(discordBot, 'getAllUsersFromChannel').mockResolvedValue(
      discordUsers
    )

    mockedUsersRepository.getUsers.mockResolvedValue(databaseUsers)
    mockedUsersRepository.deleteUser.mockResolvedValue(null)
    mockedUsersRepository.insertUser.mockResolvedValue(null)

    await refreshUsersData(db, discordBot)

    expect(mockedUsersRepository.deleteUser).toHaveBeenCalledWith('2')
    expect(mockedUsersRepository.insertUser).toHaveBeenCalledWith({
      id: '3',
      username: 'user3',
    })
    expect(mockedUsersRepository.insertUser).not.toHaveBeenCalledWith({
      id: '1',
      username: 'user1',
    })
    expect(mockedUsersRepository.deleteUser).not.toHaveBeenCalledWith('1')
  })

  test('should not delete or insert if users are the same', async () => {
    const discordUsers = [
      { id: '1', username: 'user1' },
      { id: '2', username: 'user2' },
    ]

    const databaseUsers = [
      { id: '1', username: 'user1' },
      { id: '2', username: 'user2' },
    ]

    vi.spyOn(discordBot, 'getAllUsersFromChannel').mockResolvedValue(
      discordUsers
    )

    mockedUsersRepository.getUsers.mockResolvedValue(databaseUsers)

    await refreshUsersData(db, discordBot)

    expect(mockedUsersRepository.deleteUser).not.toHaveBeenCalled()
    expect(mockedUsersRepository.insertUser).not.toHaveBeenCalled()
  })
})
