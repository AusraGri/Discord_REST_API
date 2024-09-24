import {
  Client,
  GatewayIntentBits,
  Events,
  NewsChannel,
  DMChannel,
  Channel,
  TextChannel
} from 'discord.js'

const discordBot = (botToken: string, channelId: string) => {
  if (!botToken || !channelId)
    throw new Error('No Discord Bot Toked or channel id was not provided')

  const client = new Client({ intents: [GatewayIntentBits.Guilds] })
  let channel: Channel | undefined;

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`)
  })

  client.login(botToken)

  client.on('ready', () => {
    channel = client.channels.cache.get(channelId)
    if (!channel) {
      console.error(
        'Could not find the channel. Make sure the bot has access to it.'
      )
    }

    
  })

  const getClient = () => client
  const getChannel = () => channel
  const sendMessage = async (message: string) => {
    if (channel instanceof TextChannel) {
        try {
          await (channel as TextChannel).send(message);
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      } else {
        console.error('Cannot send messages to this type of channel.');
      }
  }

  return { getClient, getChannel, sendMessage }
}

export default discordBot
