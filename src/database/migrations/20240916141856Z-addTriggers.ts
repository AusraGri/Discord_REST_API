import { Kysely, sql } from 'kysely'

export const timestamp = new Date('20240916141856Z')

export async function up(db: Kysely<any>): Promise<void> {
    await
      sql`
      CREATE TRIGGER IF NOT EXISTS handle_user_deletion
      AFTER DELETE ON users
      FOR EACH ROW
      BEGIN
        UPDATE messages
        SET username =  OLD.username
        WHERE username = OLD.username;
      END;
      `.execute(db)
}
