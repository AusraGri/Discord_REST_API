import requestSchema from './schema'

// interface GetMessagesParams {
//     username?: string;
//     sprint?: string;
//   }
export const parseUsername = (username: unknown) =>
  requestSchema.shape.username.parse(username)
export const parseSprintId = (sprint: unknown) =>
  requestSchema.shape.sprint.parse(sprint)
export const parseMessage = (message: unknown) => requestSchema.parse(message)

export class MessageService {
  constructor(private readonly messagesRepository: MessageRepository) {}

  async getMessages(username?: string, sprint?: string) {
    if (username && sprint) {
      return this.messagesRepository.findBySprintAndUsername(
        sprint,
        username
      )
    }

    if (username) {
      return this.messagesRepository.findByUsername(username)
    }

    if (sprint) {
      return this.messagesRepository.findBySprint(sprint)
    }

    return this.messagesRepository.findAll()
  }
}
