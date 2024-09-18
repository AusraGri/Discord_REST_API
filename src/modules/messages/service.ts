import { MessagesSelect, MessageRepository } from './repository'
import {requestSchema, payloadSchema} from './schema'

interface createMessageOptions {
  username: string;
  sprintCode: string;
}
export class MessageService {
  constructor(private readonly messagesRepository: MessageRepository) {}

  async getMessages(
    username?: string,
    sprint?: string
  ): Promise<MessagesSelect[] | []> {
    if (username && sprint) {
      return this.messagesRepository.findBySprintAndUsername(sprint, username)
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


export const parseRequest = (message: unknown) => requestSchema.safeParse(message)
export const parsePayload = (message: unknown) => payloadSchema.safeParse(message)

export const createCongratulation = (options: createMessageOptions ) => {
  // get random template (no template: error)
  // get random gif (no gif: error)
  // create template for discord and return it
}
