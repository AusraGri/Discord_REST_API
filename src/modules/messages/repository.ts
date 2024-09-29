import type { Selectable, Insertable } from 'kysely'
import type { Database, Messages } from '@/database'

export type MessagesSelect = Selectable<Messages>

export type MessagesInsert = Insertable<Messages>
export interface GetMessagesOptions {
  username?: string
  sprintCode?: string

  limit?: number
}

export interface MessageRepository {
  getMessages(options?: GetMessagesOptions): Promise<MessagesSelect[] | []>
  // findByUsername(username: string): Promise<MessagesSelect[] | []>
  // findBySprint(sprint: string): Promise<MessagesSelect[] | []>
  // findBySprintAndUsername(
  //   sprint: string,
  //   username: string
  // ): Promise<MessagesSelect[] | []>
  // findAll(): Promise<MessagesSelect[] | []>
  insertMessage(message: MessagesInsert): Promise<MessagesSelect | undefined>

}

export default (db: Database): MessageRepository => ({
  getMessages: async (
    options: GetMessagesOptions = {}
  ): Promise<MessagesSelect[] | []> => {
    let query = db.selectFrom('messages').selectAll()

    if (options.username !== undefined) {
      query = query
        .where('username', '=', options.username)
    }

    if (options.sprintCode !== undefined) {
      query = query.where('sprintCode', '=', options.sprintCode)
    }

    if (options.limit !== undefined && options.limit > 0) {
      query = query.limit(options.limit)
    }

    return query.execute()
  },

  // findAll: async (): Promise<MessagesSelect[]> =>
  //   db.selectFrom('messages').selectAll().execute(),

  // findByUsername: async (username: string): Promise<MessagesSelect[]> =>
  //   db
  //     .selectFrom('messages')
  //     .selectAll('messages')
  //     .where('username', '=', username)
  //     .execute(),

  // findBySprint: async (ids: string) =>
  //   db
  //     .selectFrom('messages')
  //     .selectAll('messages')
  //     .where('sprintCode', '=', ids)
  //     .execute(),

  // findBySprintAndUsername: async (sprint: string, username: string) =>
  //   db
  //     .selectFrom('messages')
  //     .selectAll('messages')
  //     .where('username', '=', username)
  //     .where('messages.sprintCode', '=', sprint)
  //     .execute(),

  insertMessage: async (message: MessagesInsert) => db.insertInto('messages').values(message).returningAll()
  .executeTakeFirst()
})
