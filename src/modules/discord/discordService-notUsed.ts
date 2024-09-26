import {
  Client,
  GatewayIntentBits,
  TextChannel,
  Events,
  MessagePayload,
  BaseMessageOptions,
} from 'discord.js'
import Logger from '@/utils/errors/ErrorLogger'
import NotFound from '@/utils/errors/NotFound'

export type DiscordUser = {
  id: string
  username: string
}

export interface DiscordBotServiceInterface {
  sendMessage(
    message: string | MessagePayload | BaseMessageOptions
  ): Promise<void>

  isBotReady(): boolean

  getAllUsersFromChannel(): Promise<DiscordUser[]>

  shutdown(): Promise<void>
}

class DiscordBotService implements DiscordBotServiceInterface {
  private client: Client

  private isReady: boolean = false

  private channel: TextChannel | undefined

  private isShuttingDown: boolean = false

  private readyPromise: Promise<void>

  constructor(botToken: string, channelId: string) {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    })

    this.readyPromise = this.initialize(botToken, channelId)

    // Handle termination signals
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())
  }

  private async initialize(botToken: string, channelId: string): Promise<void> {
    try {
      await this.client.login(botToken)

      this.client.once(Events.ClientReady, async () => {
        try {
          this.channel = (await this.client.channels.fetch(
            channelId
          )) as TextChannel

          if (!this.channel) {
            Logger.error('Channel not found')
            throw new NotFound('Channel not found')
          } else {
            Logger.info(
              `Discord bot logged in as ${this.client.user?.tag} in #${this.channel?.name}`
            )
            Logger.info('Status - [READY]')
            this.isReady = true
          }
        } catch (error) {
          Logger.error(`Failed to fetch channel: ${error.message}`)
          throw new Error(`Failed to fetch channel: ${error.message}`)
        }
      })
    } catch (error) {
      Logger.error(`Failed to login to Discord: ${error.message}`)
      throw new NotFound(`Failed to login to Discord: ${error.message}`)
    }
  }

  public async sendMessage(
    message: string | MessagePayload | BaseMessageOptions
  ): Promise<void> {
    if (!this.isReady) {
      throw new NotFound('Bot is not initialized.')
    }

    if (!this.channel) {
      throw new NotFound('Channel is not initialized.')
    }

    try {
      await this.channel.send(message)
    } catch (error) {
      throw new Error(`Failed to send message: ${error}`)
    }
  }

  public isBotReady(): boolean {
    return this.isReady
  }

  public async getAllUsersFromChannel(): Promise<DiscordUser[]> {
    if (!this.isReady || !this.channel) {
      throw new NotFound('Channel is not initialized.')
    }

    try {
      const { guild } = this.channel
      await guild.members.fetch()
      const members = guild.members.cache.filter((member) => !member.user.bot)
      return members.map((member) => ({
        id: member.user.id,
        username: member.user.username,
      }))
    } catch (error) {
      throw new Error(`Failed to fetch users`)
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
