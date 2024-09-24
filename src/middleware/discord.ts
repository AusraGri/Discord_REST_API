// discordMiddleware.ts
import { Client, TextChannel, GatewayIntentBits, Events } from 'discord.js'
import { Request, Response, NextFunction } from 'express'

const discordMiddleware = (botToken: string, channelId: string) => {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] })
  let channel: TextChannel | undefined
  let isReady = false // Flag to check if the bot is ready

  client
    .login(botToken)
    .then(() => {
      client.once(Events.ClientReady, () => {
        channel = client.channels.cache.get(channelId) as TextChannel
        if (!channel) {
          console.error(
            'Could not find the channel. Make sure the bot has access to it.'
          )
        } else {
          console.log(`Discord bot is ready as ${client.user?.tag}`)
          isReady = true // Set ready flag to true
        }
      })
    })
    .catch((err) => {
      console.error('Failed to login to Discord:', err)
    })

  return (req: Request, res: Response, next: NextFunction) => {
    req.sendMessage = async (message: string) => {
      if (isReady && channel) {
        // Check if bot is ready and channel is initialized
        try {
          await channel.send(message)
        } catch (error) {
          console.error('Failed to send message:', error)
        }
      } else {
        console.error('Channel is not initialized or bot is not ready.')
      }
    }

    next()
  }
}

export default discordMiddleware
