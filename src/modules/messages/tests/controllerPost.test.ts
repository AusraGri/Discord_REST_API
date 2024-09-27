import supertest from 'supertest'
import express from 'express'
import MockDiscordBotService from '@tests/utils/discord'
import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import cleanDatabase from '@tests/utils/createTestDatabase/cleanDatabase'
import buildController from '../controller'
import * as fixtures from './fixtures'
import jsonErrorHandler from '@/middleware/jsonErrors'
// import buildMessagesRepository from '@/modules/messages/repository'

const db = await createTestDatabase()
const app = express()

const createSprint = createFor(db, 'sprints')
const createTemplate = createFor(db, 'templates')
const createImages = createFor(db, 'images')
// const messagesRepository = buildMessagesRepository(db)

app.use(express.json())

const mockDiscordBot = new MockDiscordBotService()

const controller = buildController(db, mockDiscordBot)
app.use('/messages', controller)
app.use(jsonErrorHandler)

describe('POST /messages', () => {
  beforeAll(async () => {
    await cleanDatabase(db)
    await createImages(fixtures.images)
    await createSprint(fixtures.sprints)
    await createTemplate(fixtures.templates)
  })

  afterAll(async () => {
    await cleanDatabase(db)
  })

  beforeEach(() => {
    mockDiscordBot.sendMessage.mockClear()
  })

  test('should send a congratulatory message and return success', async () => {
    const requestBody = {
      username: 'UserOne',
      sprintCode: 'WD-1.1',
    }

    const response = await supertest(app)
      .post('/messages')
      .send(requestBody)
      .expect(200)

    expect(response.body).toEqual({
      message: expect.stringContaining(
        'Message to the Discord user: UserOne was sent at:'
      ),
    })

    expect(mockDiscordBot.sendMessage).toHaveBeenCalledTimes(1)
    expect(mockDiscordBot.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.any(String),
        files: expect.arrayContaining([expect.any(String)]),
      })
    )
  })

  test('should return a 400 error if the username does not exist', async () => {
    const requestBody = {
      username: 'NonExistentUser',
      sprintCode: 'WD-1.1',
    }

    const response = await supertest(app)
      .post('/messages')
      .send(requestBody)
      .expect(404)
    expect(response.body).toEqual({
      error: { message: 'Username does not exist in the Discord' },
    })

    expect(mockDiscordBot.sendMessage).toHaveBeenCalledTimes(0)
  })

  test('should return a 400 error if the username is missing', async () => {
    const requestBody = {
      sprintCode: 'WD-1.1',
    }

    const response = await supertest(app)
      .post('/messages')
      .send(requestBody)
      .expect(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message', 'Validation error')
    expect(mockDiscordBot.sendMessage).toHaveBeenCalledTimes(0)
  })

  test('should return a 400 error if the sprintCode is missing', async () => {
    const requestBody = {
      username: 'UserOne',
    }

    const response = await supertest(app)
      .post('/messages')
      .send(requestBody)
      .expect(400)

    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message', 'Validation error')
    expect(mockDiscordBot.sendMessage).toHaveBeenCalledTimes(0)
  })

  test('should return a 400 error if the sprintCode is invalid', async () => {
    const requestBody = {
      username: 'UserOne',
      sprintCode: 'InvalidSprintCode',
    }

    const response = await supertest(app)
      .post('/messages')
      .send(requestBody)
      .expect(400)

    expect(response.body).toEqual({
      error: { message: 'Sprint code is invalid. Not found in the database' },
    })
    expect(mockDiscordBot.sendMessage).toHaveBeenCalledTimes(0)
  })

  test('should return a 500 error if sending message fails', async () => {
    const requestBody = {
      username: 'UserOne',
      sprintCode: 'WD-1.1',
    }

    // Mock the sendMessage to throw an error
    mockDiscordBot.sendMessage.mockRejectedValue(
      new Error('Message sending failed')
    )

    const response = await supertest(app)
      .post('/messages')
      .send(requestBody)
      .expect(500)

    expect(response.body).toEqual({
      error: { message: 'Message sending failed' },
    })
  })

  // test('should return a 500 error if saving message data fails', async () => {
  //   const requestBody = {
  //     username: 'UserOne',
  //     sprintCode: 'WD-1.1',
  //   }

  //   mockDiscordBot.sendMessage.mockResolvedValue({
  //     content: 'Mock message sent',
  //     createdAt: 'timestamp',
  //     author: { username: 'MockBot' },
  //   })

  //   // Mock insertMessage to simulate a failed insertion
  //   const originalInsertMessage = messagesRepository.insertMessage
  //   messagesRepository.insertMessage = vi.fn().mockReturnValue(false)

  //   const response = await supertest(app)
  //     .post('/messages')
  //     .send(requestBody)
  //     .expect(500)

  //   expect(response.body).toEqual({
  //     error: { message: 'Failed to save sent message data to the database' },
  //   })

  //   messagesRepository.insertMessage = originalInsertMessage
  // })


})
