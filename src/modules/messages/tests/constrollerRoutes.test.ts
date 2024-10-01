import cat from 'supertest'
import express from 'express'
import createMessageController from '../controller'
import { DiscordBotServiceInterface } from '@/modules/discord/discordBotService'
import jsonErrors from '@/middleware/jsonErrors'

type Database = any

const mockDatabase = {} as Database
const mockDiscordBot = {} as DiscordBotServiceInterface

const mockGetMessages = vi.fn()
const mockSendCongratulationMessage = vi.fn()

const mockMessageService = {
  getMessages: mockGetMessages,
  sendCongratulationMessage: mockSendCongratulationMessage,
}

vi.mock('../service', () => ({
  buildMessageService: () => mockMessageService,
}))

const app = express()
app.use(express.json())
const messageController = createMessageController(mockDatabase, mockDiscordBot)
app.use('/messages', messageController)

app.use(jsonErrors)

describe('Message Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should get messages', async () => {
    const mockMessages = [{ id: 1, text: 'Hello' }]
    mockGetMessages.mockResolvedValue(mockMessages)

    const response = await cat(app).get('/messages')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockMessages)
    expect(mockGetMessages).toHaveBeenCalledTimes(1)
  })

  test('should send a congratulation message', async () => {
    mockSendCongratulationMessage.mockResolvedValue({ success: true })

    const response = await cat(app)
      .post('/messages')
      .send({ username: 'bob', sprintCode: 'none' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ success: true })
    expect(mockSendCongratulationMessage).toHaveBeenCalledTimes(1)
  })

  test('should inform about unsupported patch route', async () => {
    const response = await cat(app).patch('/messages')

    expect(response.status).toBe(405)
    expect(response.body).toEqual({ error: { message: 'Method not allowed' } })
  })

  test('should inform about unsupported delete route', async () => {
    const response = await cat(app).delete('/messages')

    expect(response.status).toBe(405)
    expect(response.body).toEqual({ error: { message: 'Method not allowed' } })
  })
})
