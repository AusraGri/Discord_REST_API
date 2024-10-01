import type { Selectable, Insertable, DeleteResult } from 'kysely'
import type { Sprints, Database } from '@/database'

export interface GetSprintsOptions {
  sprintCode?: string
  limit?: number
  sprintId?: number
}

export type SprintUpdate = {
  fullTitle?: string | undefined
  id: number
  sprintCode?: string | undefined
}
export type SprintSelect = Selectable<Sprints>

export type SprintInsert = Insertable<Sprints>

export interface SprintsRepository {
  getSprints(options?: GetSprintsOptions): Promise<SprintSelect[] | []>
  //   getSprintBySprintCode(sprint: string): Promise<SprintSelect | undefined>
  insertSprint(sprint: SprintInsert): Promise<SprintSelect | undefined>
  updateSprint(sprint: SprintUpdate): Promise<SprintSelect | undefined>
  deleteSprint(sprintId: number): Promise<DeleteResult>
}

export default (db: Database): SprintsRepository => ({
  getSprints: async (
    options: GetSprintsOptions = {}
  ): Promise<SprintSelect[] | []> => {
    let query = db.selectFrom('sprints').selectAll()

    if (options.sprintCode !== undefined) {
      query = query.where('sprintCode', '=', options.sprintCode)
    }
    if (options.sprintId !== undefined) {
      query = query.where('id', '=', options.sprintId)
    }

    if (options.limit !== undefined && options.limit > 0) {
      query = query.limit(options.limit)
    }

    return query.execute()
  },
  //   getSprints: async () => db.selectFrom('sprints').selectAll().execute(),

  //   getSprintBySprintCode: async (sprintC: string) =>
  //     db
  //       .selectFrom('sprints')
  //       .where('sprintCode', '=', sprintC)
  //       .selectAll()
  //       .executeTakeFirst(),

  insertSprint: async (sprint: SprintInsert) =>
    db.insertInto('sprints').values(sprint).returningAll().executeTakeFirst(),

  updateSprint: async (sprint: SprintUpdate) => {
    await db
      .updateTable('sprints')
      .set({ fullTitle: sprint.fullTitle, sprintCode: sprint.sprintCode })
      .where('id', '=', sprint.id)
      .executeTakeFirst()

    const updatedSprint: SprintSelect | undefined = await db
      .selectFrom('sprints')
      .selectAll()
      .where('id', '=', sprint.id)
      .executeTakeFirst()

    return updatedSprint
  },

  deleteSprint: async (sprintId: number) =>
    db.deleteFrom('sprints').where('id', '=', sprintId).executeTakeFirst(),
})
