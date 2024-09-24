import { Kysely, Insertable } from 'kysely'
import type { Sprints } from '../types'


type SprintInsert = Insertable<Sprints>
export const timestamp = new Date('20240917135110Z')

const SPRINT_IDS: SprintInsert[] = [
  { sprintCode: 'WD-1.1', fullTitle: 'First Steps Into Programming with Python' },
  { sprintCode: 'WD-1.2', fullTitle: 'Intermediate Programming with Python' },
  { sprintCode: 'WD-1.3', fullTitle: 'Object Oriented Programming' },
  { sprintCode: 'WD-1.4', fullTitle: 'Fundamentals of Programming & Computer Science' },
  { sprintCode: 'WD-2.1', fullTitle: 'HTML and CSS - the Foundation of Web Pages' },
  { sprintCode: 'WD-2.2', fullTitle: 'Improving Websites with Javascript' },
  { sprintCode: 'WD-2.3', fullTitle: 'Node.js and Relational Databases' },
  { sprintCode: 'WD-3.1', fullTitle: 'Learning Your First Framework - Vue.js' },
  { sprintCode: 'WD-3.2', fullTitle: 'Typing and Testing JavaScript' },
  { sprintCode: 'WD-3.3', fullTitle: 'REST APIs & Test Driven Development' },
  { sprintCode: 'WD-3.4', fullTitle: 'Full-stack Fundamentals' },
  { sprintCode: 'WD-3.5', fullTitle: 'Containers and CI/CD' },
]
export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('sprints')
    .values(
      SPRINT_IDS.map((sprint) => ({
        sprint_code: sprint.sprintCode,
        full_title: sprint.fullTitle, // Manually map to snake_case
      }))
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('sprints')
    .where(
      'id',
      'in',
      SPRINT_IDS.map((sprint) => sprint.sprintCode)
    )
    .execute()
}
