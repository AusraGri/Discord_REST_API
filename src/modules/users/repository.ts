import type { Selectable, Insertable, DeleteResult } from 'kysely'
import type { Users, Database } from '@/database'

export type UsersSelect = Selectable<Users>
export type UsersInsert = Insertable<Users>

export default (db: Database) => ({
  getUsers: async () => db.selectFrom('users').selectAll().execute(),

  getUserByUsername: async (username: string) =>
    db
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .execute(),

  insertUser: async (user: UsersInsert) =>
    db.insertInto('users').values(user).returningAll().executeTakeFirst(),

  refreshUsers: async (newUsers: UsersInsert[]) => {
    // Mark all users as not in the channel initially
    await db.updateTable('users').set({ inDiscord: 0 })

    // Prepare an array of update and insert promises
    const updatePromises = newUsers.map(async (user) => {
      // Update existing users and mark them as in the channel
      const updateResult = await db
        .updateTable('users')
        .set({ username: user.username, inDiscord: 1 })
        .where('id', '=', user.id)
        .executeTakeFirst()

      // Check if the user exists
      if (!updateResult) {
        // If the user does not exist, insert them
        return db
          .insertInto('users')
          .values({
            id: user.id,
            username: user.username,
            inDiscord: 1,
          })
          .executeTakeFirst()
      }
    })

    // Wait for all promises to resolve
    await Promise.all(updatePromises)
  },
})
