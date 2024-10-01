import { Kysely } from 'kysely'

export const timestamp = new Date('20240916131856Z')

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createIndex('idx_messages_username')
    .on('messages')
    .column('username')
    .execute()

  await db.schema
    .createIndex('idx_messages_sprint_code')
    .on('messages')
    .column('sprint_code')
    .execute()

  await db.schema
    .createIndex('idx_messages_user_sprint')
    .on('messages')
    .columns(['username', 'sprint_code'])
    .execute()

  await db.schema
    .createIndex('idx_templates_id')
    .on('templates')
    .column('id')
    .execute()

  await db.schema
    .createIndex('idx_sprints_sprint_code')
    .on('sprints')
    .column('sprint_code')
    .execute()

  await db.schema
    .createIndex('idx_users_username')
    .on('users')
    .column('username')
    .execute()
}
