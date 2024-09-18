import type { Selectable } from 'kysely'
import type { Database, Messages } from '@/database'

export type MessagesSelect = Selectable<Messages>
export interface MessageRepository {
  findByUsername(username: string): Promise<MessagesSelect[] | []>
  findBySprint(sprint: string): Promise<MessagesSelect[] | []>
  findBySprintAndUsername(
    sprint: string,
    username: string
  ): Promise<MessagesSelect[] | []>
  findAll(): Promise<MessagesSelect[] | []>
}
export default (db: Database): MessageRepository => ({
  findAll: async (): Promise<MessagesSelect[]> =>
    db.selectFrom('messages').selectAll().execute(),

  findByUsername: async (username: string): Promise<MessagesSelect[]> =>
    db
      .selectFrom('messages')
      .innerJoin('users', 'users.id', 'messages.userId')
      .selectAll('messages')
      .where('users.username', '=', username)
      .execute(),

  findBySprint: async (ids: string) =>
    db
      .selectFrom('messages')
      .selectAll('messages')
      .where('sprintId', '=', ids)
      .execute(),

  findBySprintAndUsername: async (sprintId: string, username: string) =>
    db
      .selectFrom('messages')
      .innerJoin('users', 'users.id', 'messages.userId')
      .selectAll('messages')
      .where('users.username', '=', username)
      .where('messages.sprintId', '=', sprintId)
      .execute(),
})
