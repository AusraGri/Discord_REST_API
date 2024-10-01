import { Mock } from 'vitest'
import MockDiscordBotService from '@tests/utils/discord'
import { buildMessageService } from '../service'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'
import * as validators from '../validators'
import getRandomTemplate from '../utils/getRandomTemplate'
import getRandomImageUrl from '../utils/getRandomImageUrl'

type Database = any

const mockDb = {} as Database

const mockMessagesRepository = {
  getMessages: vi.fn(),
  insertMessage: vi.fn(),
}
const mockSprintsRepository = {
  getSprints: vi.fn(),
}
const mockUsersManager = {
  getUser: vi.fn(),
}
const mockImageRepository = {
  getImages: vi.fn(),
}

vi.mock('../validators', () => ({
  validateGetMessagesRequest: vi.fn(),
  validatePostMessageRequest: vi.fn(),
}))

vi.mock('../repository', () => ({
  default: vi.fn(() => mockMessagesRepository),
}))

vi.mock('@/modules/users/utils/refreshUsersData', () => ({
  default: vi.fn(),
}))

vi.mock('@/modules/users/utils/usersManager', () => ({
  default: vi.fn(() => mockUsersManager),
}))

vi.mock('../utils/getRandomTemplate', () => ({
  default: vi.fn(),
}))

vi.mock('../utils/formMessage', () => ({
  default: vi.fn(),
}))

vi.mock('../utils/getRandomImageUrl', () => ({
  default: vi.fn(),
}))

vi.mock('@/modules/sprints/repository', () => ({
  default: vi.fn(() => mockSprintsRepository),
}))

vi.mock('@/modules/images/repository', () => ({
  default: vi.fn(() => mockImageRepository),
}))

const discordBot = new MockDiscordBotService()

describe('Message Service', () => {
  let messageService: ReturnType<typeof buildMessageService>

  const mockedGetMessageValidator =
    validators.validateGetMessagesRequest as Mock
  const mockedPostMessageValidator =
    validators.validatePostMessageRequest as Mock

  beforeEach(() => {
    vi.clearAllMocks()
    messageService = buildMessageService(mockDb, discordBot)
  })

  describe('getMessages', () => {
    test('should return messages when found', async () => {
      const req = {
        query: { username: 'user1', sprint: 'sprint1', limit: 10 },
      } as any
      const messages = [{ id: 1, content: 'Test message' }]

      mockedGetMessageValidator.mockReturnValue(req.query)
      mockMessagesRepository.getMessages.mockResolvedValue(messages)

      const result = await messageService.getMessages(req)

      expect(result).toEqual(messages)
      expect(mockMessagesRepository.getMessages).toHaveBeenCalledWith({
        username: 'user1',
        sprintCode: 'sprint1',
        limit: 10,
      })
    })

    test('should throw BadRequest error if required fields are missing', async () => {
      const req = { query: { username: 'user1' } } as any

      mockedGetMessageValidator.mockImplementation(() => {
        throw new BadRequest('Required fields are missing')
      })

      await expect(messageService.getMessages(req)).rejects.toThrow(BadRequest)
    })

    test('should throw NotFound error if no messages are found', async () => {
      const req = {
        query: { username: 'user1', sprint: 'sprint1', limit: 10 },
      } as any

      mockedGetMessageValidator.mockReturnValue(req.query)
      mockMessagesRepository.getMessages.mockResolvedValue([])

      await expect(messageService.getMessages(req)).rejects.toThrow(NotFound)
    })
  })

  describe('sendCongratulationMessage', () => {
    const req = { body: { username: 'user1', sprintCode: 'sprint1' } } as any
    const user = { id: '123', username: 'user1' }
    const template = { id: 'template1', text: 'Congrats!' }
    const sprint = { id: 'sprint1', fullTitle: 'Sprint 1' }
    const messageSent = { content: 'Message content', createdAt: new Date() }
    const imageUrl = 'http://example.com/image.png'

    test('should send a congratulatory message and save it', async () => {
      const mockedGetRandomTemplate = getRandomTemplate as Mock
      const mockedRandomImageUrl = getRandomImageUrl as Mock

      mockedPostMessageValidator.mockReturnValue(req.body)
      mockUsersManager.getUser.mockResolvedValue(user)
      mockSprintsRepository.getSprints.mockResolvedValue([sprint])
      mockedGetRandomTemplate.mockResolvedValue(template)
      mockImageRepository.getImages.mockResolvedValue([imageUrl])
      mockedRandomImageUrl.mockReturnValue(imageUrl)
      discordBot.sendMessage.mockResolvedValue(messageSent)
      mockMessagesRepository.insertMessage.mockResolvedValue(true)

      const result = await messageService.sendCongratulationMessage(req)

      expect(result).toEqual({
        message: `Message to the Discord user: user1 was sent at: ${messageSent.createdAt}`,
      })
      expect(mockMessagesRepository.insertMessage).toHaveBeenCalledWith({
        gifUrl: imageUrl,
        originalMessage: messageSent.content,
        sprintCode: req.body.sprintCode,
        sprintId: sprint.id,
        sprintTitle: sprint.fullTitle,
        templateId: template.id,
        templateText: template.text,
        username: req.body.username,
      })
    })

    test('should throw NotFound error if the user does not exist', async () => {
      const badReq = {
        body: { username: 'nonexistent', sprintCode: 'sprint1' },
      } as any

      mockedPostMessageValidator.mockReturnValue(badReq.body)
      mockUsersManager.getUser.mockResolvedValue(null)

      await expect(
        messageService.sendCongratulationMessage(req)
      ).rejects.toThrow(NotFound)
    })

    test('should throw BadRequest if sprint code is invalid', async () => {
      const badReq = {
        body: { username: 'user1', sprintCode: 'invalidSprint' },
      } as any

      mockedPostMessageValidator.mockReturnValue(badReq.body)
      mockUsersManager.getUser.mockResolvedValue(user)
      mockSprintsRepository.getSprints.mockResolvedValue([])

      await expect(
        messageService.sendCongratulationMessage(req)
      ).rejects.toThrow(BadRequest)
    })

    test('should throw BadRequest if required fields are missing in body', async () => {
      const badReq = { body: { username: 'user1' } } as any

      mockedPostMessageValidator.mockReturnValue(badReq.body)

      await expect(
        messageService.sendCongratulationMessage(req)
      ).rejects.toThrow(BadRequest)
    })

    test('should throw NotFound if no random template is found', async () => {
      mockedPostMessageValidator.mockReturnValue(req.body)
      mockUsersManager.getUser.mockResolvedValue(user)
      mockSprintsRepository.getSprints.mockResolvedValue([sprint])
      const mockedGetRandomTemplate = getRandomTemplate as Mock
      mockedGetRandomTemplate.mockResolvedValue(null)

      await expect(
        messageService.sendCongratulationMessage(req)
      ).rejects.toThrow(Error)
    })

    test('should throw an error if there are no images available', async () => {
      mockedPostMessageValidator.mockReturnValue(req.body)
      mockUsersManager.getUser.mockResolvedValue(user)
      mockSprintsRepository.getSprints.mockResolvedValue([sprint])
      const mockedGetRandomTemplate = getRandomTemplate as Mock
      mockedGetRandomTemplate.mockResolvedValue(template)
      mockImageRepository.getImages.mockResolvedValue([])

      await expect(
        messageService.sendCongratulationMessage(req)
      ).rejects.toThrow(Error)
    })

    test('should throw an error if sending message fails', async () => {
      mockedPostMessageValidator.mockReturnValue(req.body)
      mockUsersManager.getUser.mockResolvedValue(user)
      mockSprintsRepository.getSprints.mockResolvedValue([sprint])
      const mockedGetRandomTemplate = getRandomTemplate as Mock
      mockedGetRandomTemplate.mockResolvedValue(template)
      mockImageRepository.getImages.mockResolvedValue([imageUrl])
      discordBot.sendMessage.mockResolvedValue(undefined)

      await expect(
        messageService.sendCongratulationMessage(req)
      ).rejects.toThrow(Error)
    })

    test('should throw an error if message data saving fails', async () => {
      mockedPostMessageValidator.mockReturnValue(req.body)
      mockUsersManager.getUser.mockResolvedValue(user)
      mockSprintsRepository.getSprints.mockResolvedValue([sprint])
      const mockedGetRandomTemplate = getRandomTemplate as Mock
      mockedGetRandomTemplate.mockResolvedValue(template)
      mockImageRepository.getImages.mockResolvedValue([imageUrl])
      discordBot.sendMessage.mockResolvedValue(messageSent)
      mockMessagesRepository.insertMessage.mockResolvedValue(false)

      await expect(
        messageService.sendCongratulationMessage(req)
      ).rejects.toThrow(Error)
    })
  })
})
