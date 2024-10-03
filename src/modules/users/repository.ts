import type { Selectable, Insertable, DeleteResult } from 'kysely'
import type { Users, Database } from '@/database'

export type UsersSelect = Selectable<Users>
export type UsersInsert = Insertable<Users>

export interface UsersRepository {
  getUsers(): Promise<UsersSelect[]>

  getUserByUsername(username: string): Promise<UsersSelect | undefined>

  insertUser(user: UsersInsert): Promise<UsersSelect | undefined>

  deleteUser(id: string): Promise<DeleteResult>

}

export default (db: Database): UsersRepository => ({
  getUsers: async () => db.selectFrom('users').selectAll().execute(),

  getUserByUsername: async (username: string) =>
    db
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirst(),

  insertUser: async (user: UsersInsert) =>
    db.insertInto('users').values(user).returningAll().executeTakeFirst(),

  deleteUser: async (id: string) =>
    db.deleteFrom('users').where('id', '=', id).executeTakeFirst(),

})
