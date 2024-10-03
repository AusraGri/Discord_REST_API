import { Kysely, Insertable } from 'kysely'
import type { Sprints } from '../types'
import { sprints } from '../data/sprintData'

type SprintInsert = Insertable<Sprints>

export const timestamp = new Date('20240917135110Z')

const sprintsData: SprintInsert[] = [...sprints]
export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('sprints')
    .values(
      sprintsData.map((sprint) => ({
        sprint_code: sprint.sprintCode,
        full_title: sprint.fullTitle,
      }))
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('sprints').execute()
}
