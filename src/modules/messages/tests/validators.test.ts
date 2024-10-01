import {
  validatePostMessageRequest,
  validateGetMessagesRequest,
} from '../validators' // Import your validators

describe('Validator Tests', () => {
  test('should validate a valid post message request', () => {
    const validMessage = { username: 'Bob', sprintCode: 'Sprint1' } // Adjust according to your payloadSchema
    expect(() => validatePostMessageRequest(validMessage)).not.toThrow()
  })

  test('should throw an error for an invalid post message request', () => {
    const invalidMessage = { text: 123 } // Adjust according to your payloadSchema
    expect(() => validatePostMessageRequest(invalidMessage)).toThrow()
  })

  test('should validate a valid get messages request', () => {
    const validRequest = { limit: 10, sprint: 'Sprint1', username: 'Bob' } // Adjust according to your requestSchema
    expect(() => validateGetMessagesRequest(validRequest)).not.toThrow()
  })

  test('should throw an error for an invalid get messages request', () => {
    const invalidRequest = { limit: 'ten' } // Adjust according to your requestSchema
    expect(() => validateGetMessagesRequest(invalidRequest)).toThrow()
  })
})
