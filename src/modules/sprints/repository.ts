import type { Selectable, Insertable, DeleteResult } from 'kysely'
import type { Sprints, Database } from '@/database'

export interface GetSprintsOptions {
  sprintCode?: string
  limit?: number
}

export type SprintSelect = Selectable<Sprints>

export type SprintInsert = Insertable<Sprints>

export interface SprintsRepository {
  getSprints(options?: GetSprintsOptions): Promise<SprintSelect[] | []>
  //   getSprintBySprintCode(sprint: string): Promise<SprintSelect | undefined>
  insertSprint(sprint: SprintInsert): Promise<SprintSelect | undefined>
  updateSprint(sprint: SprintInsert): Promise<SprintSelect | undefined>
  deleteSprint(sprintC: string): Promise<DeleteResult>
}

export default (db: Database): SprintsRepository => ({
  getSprints: async (
    options: GetSprintsOptions = {}
  ): Promise<SprintSelect[] | []> => {
    let query = db.selectFrom('sprints').selectAll()

    if (options.sprintCode !== undefined) {
      query = query.where('sprintCode', '=', options.sprintCode)
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

  updateSprint: async (sprint: SprintInsert) => {
    await db
      .updateTable('sprints')
      .set({ fullTitle: sprint.fullTitle })
      .where('sprintCode', '=', sprint.sprintCode)
      .executeTakeFirst()

    const updatedSprint: SprintSelect | undefined = await db
      .selectFrom('sprints')
      .selectAll()
      .where('sprintCode', '=', sprint.sprintCode)
      .executeTakeFirst()

    return updatedSprint
  },

  deleteSprint: async (sprintC: string) =>
    db
      .deleteFrom('sprints')
      .where('sprintCode', '=', sprintC)
      .executeTakeFirst(),
})
