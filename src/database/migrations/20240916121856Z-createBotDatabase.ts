import { Kysely, sql } from 'kysely'

export const timestamp = new Date('20240916121856Z')

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('templates')
    .ifNotExists()
    .addColumn('id', 'integer', (col) =>
      col.primaryKey().unique().autoIncrement().notNull()
    )
    .addColumn('text', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('sprints')
    .ifNotExists()
    .addColumn('id', 'varchar(50)', (c) => c.primaryKey().notNull())
    .addColumn('full_title', 'varchar(255)', (c) => c.notNull())
    .execute()

  await db.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn('username', 'varchar(100)', (c) => c.notNull().unique())
    .execute()

  await db.schema
    .createTable('messages')
    .ifNotExists()
    .addColumn('id', 'integer', (c) => c.primaryKey().autoIncrement().notNull())
    .addColumn('user_id', 'integer', (c) => c.notNull().references('users.id'))
    .addColumn('sprint_id', 'varchar(50)', (c) =>
      c.notNull().references('sprints.id')
    )
    .addColumn('original_message', 'text', (c) => c.notNull())
    .addColumn('template_id', 'integer', (c) =>
      c.notNull().references('templates.id')
    )
    .addColumn('gif_url', 'varchar(255)', (c) => c.notNull())
    .addColumn('created_at', 'timestamp', (c) =>
      c.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

