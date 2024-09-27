import {
  DiscordBotServiceInterface,
  DiscordUser,
} from '@/modules/discord/discordBotService'

class MockDiscordBotService implements DiscordBotServiceInterface {
  private users: DiscordUser[] = [
    { id: '3', username: 'UserOne' },
    { id: '4', username: 'UserTwo' },
  ]

  sendMessage = vi.fn().mockResolvedValue({
    content: 'Mock message sent',
    author: { username: 'UserOne' },
    createdAt: 'timestamp'
  })

  getAllUsersFromChannel = vi.fn().mockResolvedValue(this.users)

  shutdown = vi.fn().mockResolvedValue(undefined)

}

export default MockDiscordBotService
