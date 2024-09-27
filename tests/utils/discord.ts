import {
  DiscordBotServiceInterface,
  DiscordUser,
} from '@/modules/discord/discordBotService'

class MockDiscordBotService implements DiscordBotServiceInterface {
  private users: DiscordUser[] = [
    { id: '1', username: 'UserOne' },
    { id: '2', username: 'UserTwo' },
  ]

  sendMessage = vi.fn().mockResolvedValue({
    content: 'Mock message sent',
    author: { username: 'MockBot' },
  })

  getAllUsersFromChannel = vi.fn().mockResolvedValue(this.users)

  shutdown = vi.fn().mockResolvedValue(undefined)

}

export default MockDiscordBotService
