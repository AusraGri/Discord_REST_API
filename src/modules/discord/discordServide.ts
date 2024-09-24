import {
  Client,
  GatewayIntentBits,
  TextChannel,
  Events,
  MessagePayload,
  BaseMessageOptions,
} from 'discord.js'

export type DiscordUser = {
    id: string,
    username: string
}
class DiscordBotService {
  private client: Client

  private isReady: boolean = false

  private channel: TextChannel | undefined

  private isShuttingDown: boolean = false

  constructor(botToken: string, channelId: string) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // Add this to fetch members
      ],
    })

    this.client
      .login(botToken)
      .then(() => {
        this.client.once(Events.ClientReady, () => {
          console.log(`Discord bot logged in as ${this.client.user?.tag}`)
          this.channel = this.client.channels.cache.get(
            channelId
          ) as TextChannel

          if (!this.channel) {
            console.error(
              'Could not find the channel. Ensure the bot has access to it.'
            )
          } else {
            this.isReady = true
          }
        })
      })
      .catch((err) => {
        console.error('Failed to login to Discord:', err)
      })

    // Handle termination signals
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())
  }

  public async sendMessage(
    message: string | MessagePayload | BaseMessageOptions
  ): Promise<void> {
    if (this.isReady && this.channel) {
      try {
        await this.channel.send(message)
      } catch (error) {
        console.error('Failed to send message:', error)
      }
    } else {
      console.error('Bot is not ready or channel is not initialized.')
    }
  }

  public isBotReady(): boolean {
    return this.isReady
  }

  /**
   * Fetches all usernames from the channel's guild.
   */
  public async getAllUsersFromChannel(): Promise<DiscordUser[]> {
    if (!this.isReady || !this.channel) {
      console.error('Bot is not ready or channel is not initialized.')
      return []
    }

    try {
      // eslint-disable-next-line prefer-destructuring
      const guild = this.channel.guild // Get the guild (server) the channel belongs to
      await guild.members.fetch() // Fetch all members of the guild

      const members = guild.members.cache.filter((member) => !member.user.bot) // Exclude bots

      // Return an array of usernames
      return members.map((member) => ({id: member.user.id, username: member.user.username}))
    } catch (error) {
      console.error('Failed to fetch users:', error)
      return []
    }
  }

  public async shutdown(): Promise<void> {
    if (this.isShuttingDown) return
    this.isShuttingDown = true

    await this.client.destroy()
    console.log(`\n Shutting down gracefully...`)
    process.exit(0)
  }
}

export default DiscordBotService
