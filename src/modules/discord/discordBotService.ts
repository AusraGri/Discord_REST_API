import {
  Client,
  GatewayIntentBits,
  TextChannel,
  Events,
  MessagePayload,
  BaseMessageOptions,
  Message,
} from 'discord.js'
import NotFound from '@/utils/errors/NotFound'
import Logger from '@/utils/errors/ErrorLogger'

export type DiscordUser = {
  id: string
  username: string
}

export interface DiscordBotServiceInterface {
  sendMessage(
    message: string | MessagePayload | BaseMessageOptions
  ): Promise<Message>

  getAllUsersFromChannel(): Promise<DiscordUser[]>

  shutdown(): Promise<void>
}

class DiscordBotService implements DiscordBotServiceInterface {
  private client: Client

  private channel: TextChannel | undefined

  private isShuttingDown: boolean = false

  private readyPromise: Promise<void>

  constructor(botToken: string, channelId: string) {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    })

    // Create a promise that will resolve when the bot is ready
    this.readyPromise = new Promise((resolve, reject) => {
      this.client
        .login(botToken)
        .then(() => {
          this.client.once(Events.ClientReady, async () => {
            try {
              this.channel = (await this.client.channels.fetch(
                channelId
              )) as TextChannel

              if (!this.channel) {
                Logger.error('Channel not found')
                reject(new NotFound('Channel not found'))
              } else {
                Logger.info(
                  `Discord bot logged in as ${this.client.user?.tag} in #${this.channel?.name}`
                )
                Logger.info('status - [READY]')
                resolve()
              }
            } catch (error) {
              reject(new Error(`Failed to fetch channel: ${error}`))
            }
          })
        })
        .catch((err) => {
          reject(new NotFound(`Failed to login to Discord: ${err.message}`))
        })
    })

    // Handle termination signals
    process.on('SIGINT', () => this.shutdown())
    process.on('SIGTERM', () => this.shutdown())
  }

  public async awaitReady(): Promise<void> {
    try {
      await this.readyPromise
    } catch (error) {
      Logger.error(`Discord bot failed to initialize \n ${error}`)
      await this.client.destroy()
      process.exit(1)
    }
  }

  public async sendMessage(
    message: string | MessagePayload | BaseMessageOptions
  ): Promise<Message> {
    await this.awaitReady()

    if (!this.channel) {
      throw new NotFound('Channel is not initialized.')
    }

    try {
      const messageBack = await this.channel.send(message)
      return messageBack
    } catch (error) {
      throw new Error(`Failed to send message: ${error}`)
    }
  }

  public async getAllUsersFromChannel(): Promise<DiscordUser[]> {
    await this.awaitReady()
    if (!this.channel) {
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
    Logger.info(`Shutting down discord bot...`)
    process.exit(0)
  }
}

export default DiscordBotService
