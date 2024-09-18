import type { Selectable, Insertable, InsertResult, UpdateResult } from 'kysely'
import type { Templates, Database } from '@/database'

export type TemplatesSelect = Selectable<Templates>
export type TemplatesInsert = Insertable<Templates>

interface GetTemplatesOptions {
    id?: number;
    limit?: number;
  }

export interface TemplatesRepository {
    getTemplates (options?: GetTemplatesOptions): Promise<TemplatesSelect[] | []>
    insertTemplate (template: TemplatesInsert): Promise<InsertResult>
    patchTemplateById (template: TemplatesSelect): Promise<UpdateResult>
}

export default (db: Database) : TemplatesRepository => ({
  getTemplates: async ( options: GetTemplatesOptions = {}
  ): Promise<TemplatesSelect[] | []> => {
    let query = db.selectFrom('templates').selectAll()

    if (options.id !== undefined) {
      query = query.where('id', '=', options.id)
    }

    if (options.limit !== undefined && options.limit > 0) {
      query = query.limit(options.limit)
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
