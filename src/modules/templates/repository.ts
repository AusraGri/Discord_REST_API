import type { Selectable, Insertable, DeleteResult } from 'kysely'
import type { Templates, Database } from '@/database'

export type TemplatesSelect = Selectable<Templates>
export type TemplatesInsert = Insertable<Templates>

export interface GetTemplatesOptions {
  id?: number
  limit?: number
}

export interface TemplatesRepository {
  getTemplates(options?: GetTemplatesOptions): Promise<TemplatesSelect[] | []>
  insertTemplate(
    template: TemplatesInsert
  ): Promise<TemplatesSelect | undefined>
  patchTemplate(template: TemplatesSelect): Promise<TemplatesSelect | undefined>
  deleteTemplate(id: number): Promise<DeleteResult>
}

export default (db: Database): TemplatesRepository => ({
  getTemplates: async (
    options: GetTemplatesOptions = {}
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

  insertTemplate: async (
    template: Omit<TemplatesInsert, 'id'>
  ): Promise<TemplatesSelect | undefined> => {
    const newTemplate: TemplatesSelect | undefined = await db
      .insertInto('templates')
      .values(template)
      .returningAll()
      .executeTakeFirst()

    return newTemplate
  },

  patchTemplate: async (
    template: TemplatesSelect
  ): Promise<TemplatesSelect | undefined> => {
    await db
      .updateTable('templates')
      .set({ text: template.text })
      .where('id', '=', template.id)
      .executeTakeFirst()

    const updatedTemplate: TemplatesSelect | undefined = await db
      .selectFrom('templates')
      .selectAll()
      .where('id', '=', template.id)
      .executeTakeFirst()

    return updatedTemplate
  },

  deleteTemplate: async (id: number): Promise<DeleteResult> =>
    db.deleteFrom('templates').where('id', '=', id).executeTakeFirst(),
})
