import { userMention } from 'discord.js'
import formDiscordMessage from '../formMessage'

describe('formDiscordMessage', () => {
  test('should return a formatted message with user mention and sprint title', async () => {
    const options = {
      template: '{username}, please review the sprint: {sprint}',
      user: { id: '123456', username: 'Bob' }, // Example user object
      sprintTitle: 'Sprint 1',
    }

    const expectedMessage = `${userMention('123456')}, please review the sprint: Sprint 1`

    const result = await formDiscordMessage(options)

    expect(result).toBe(expectedMessage)
  })

  test('should retain placeholders if the replacement value is not provided', async () => {
    const options = {
      template: 'Hello {username}, your sprint is {sprint}.',
      user: { id: '123456', username: 'Bob' },
      sprintTitle: '',
    }

    const expectedMessage = `Hello ${userMention('123456')}, your sprint is .`

    const result = await formDiscordMessage(options)

    expect(result).toBe(expectedMessage)
  })

  test('should handle templates with multiple placeholders', async () => {
    const options = {
      template: '{username}, welcome to {sprint}!',
      user: { id: '654321', username: 'Bob' },
      sprintTitle: 'Sprint 2',
    }

    const expectedMessage = `${userMention('654321')}, welcome to Sprint 2!`

    const result = await formDiscordMessage(options)

    expect(result).toBe(expectedMessage)
  })

  test('should not replace non-existing placeholders', async () => {
    const options = {
      template:
        'Hi {username}, your sprint {sprint} is starting. Please check {unknown}.',
      user: { id: '789012', username: 'Mob' },
      sprintTitle: 'Sprint 3',
    }

    const expectedMessage = `Hi ${userMention('789012')}, your sprint Sprint 3 is starting. Please check {unknown}.`

    const result = await formDiscordMessage(options)

    expect(result).toBe(expectedMessage)
  })
})
