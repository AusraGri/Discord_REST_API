import type { Selectable, Insertable, InsertResult, UpdateResult } from 'kysely'
import type { Templates, Database } from '@/database'

export type TemplatesSelect = Selectable<Templates>
export type TemplatesInsert = Insertable<Templates>

export default (db: Database) => ({
  getTemplates: async (
    id?: number,
    limit?: number
  ): Promise<TemplatesSelect[] | []> => {
    let query = db.selectFrom('templates').selectAll()

    if (id !== undefined) {
      query = query.where('id', '=', id)
    }

    if (limit !== undefined) {
      query = query.limit(limit)
    }

    return query.execute()
  },

  insertTemplate: async (template: TemplatesInsert): Promise<InsertResult> =>
    db.insertInto('templates').values(template).executeTakeFirst(),

  patchTemplateById: async (template: TemplatesSelect): Promise<UpdateResult> =>
    db
      .updateTable('templates')
      .set({ text: template.text })
      .where('id', '=', template.id)
      .executeTakeFirst(),
})
