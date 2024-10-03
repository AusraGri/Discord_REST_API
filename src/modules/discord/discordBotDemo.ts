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

export interface DiscordBotManager {
  initClient(): Promise<void>
  sendMessage(
    message: string | MessagePayload | BaseMessageOptions
  ): Promise<Message>

  fetchAllUsersFromChannel(): Promise<DiscordUser[]>

  shutdownBot(): Promise<void>
}

const discordBotManager = (
  token: string,
  channelId: string
): DiscordBotManager => {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  })

  let channel: TextChannel
  let isBotReady: boolean
  let isShuttingDown: boolean

  const initClient = async () => {
    try {
      await client.login(token)
      client.once(Events.ClientReady, async () => {
        channel = (await client.channels.fetch(channelId)) as TextChannel
        if (!channel) throw new Error('Cant login to channel')
        isBotReady = true
      })
    } catch (error) {
      console.log(error)
    }
  }

  const sendMessage = async (
    message: string | MessagePayload | BaseMessageOptions
  ) => {
    try {
      if (!isBotReady) throw new Error('bot is not ready')
      const sentMessage = await channel.send(message)
      return sentMessage
    } catch (error) {
      console.log('error while sending message')
      throw new Error(error.message)
    }
  }

  const fetchAllUsersFromChannel = async () => {
    try {
      if (!isBotReady) throw new Error('bot is not ready')
      const { guild } = channel

      await guild.members.fetch()

      const members = guild.members.cache.filter((member) => !member.user.bot)

      return members.map((member) => ({
        id: member.user.id,
        username: member.user.username,
      }))
    } catch (error) {
      console.log(error)
      throw new Error(error.message)
    }
  }

  const shutdownBot = async () => {
    try {
      if (isShuttingDown) return
      isShuttingDown = true

      await client.destroy()
      Logger.info(`Discord bot disconnected new`)
      process.exit(0)
    } catch (error) {
      console.log(error)
    }
  }

  process.on('SIGINT', () => shutdownBot())
  process.on('SIGTERM', () => shutdownBot())

  return { initClient, sendMessage, fetchAllUsersFromChannel, shutdownBot }
}

export default discordBotManager
