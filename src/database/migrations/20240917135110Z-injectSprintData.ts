import { Kysely } from 'kysely'
import type { Sprints } from '../types'

export const timestamp = new Date('20240917135110Z')

const SPRINT_IDS: Sprints[] = [
  { id: 'WD-1.1', fullTitle: 'First Steps Into Programming with Python' },
  { id: 'WD-1.2', fullTitle: 'Intermediate Programming with Python' },
  { id: 'WD-1.3', fullTitle: 'Object Oriented Programming' },
  { id: 'WD-1.4', fullTitle: 'Fundamentals of Programming & Computer Science' },
  { id: 'WD-2.1', fullTitle: 'HTML and CSS - the Foundation of Web Pages' },
  { id: 'WD-2.2', fullTitle: 'Improving Websites with Javascript' },
  { id: 'WD-2.3', fullTitle: 'Node.js and Relational Databases' },
  { id: 'WD-3.1', fullTitle: 'Learning Your First Framework - Vue.js' },
  { id: 'WD-3.2', fullTitle: 'Typing and Testing JavaScript' },
  { id: 'WD-3.3', fullTitle: 'REST APIs & Test Driven Development' },
  { id: 'WD-3.4', fullTitle: 'Full-stack Fundamentals' },
  { id: 'WD-3.5', fullTitle: 'Containers and CI/CD' },
]
export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('sprints')
    .values(
      SPRINT_IDS.map((sprint) => ({
        id: sprint.id,
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
      SPRINT_IDS.map((sprint) => sprint.id)
    )
    .execute()
}
