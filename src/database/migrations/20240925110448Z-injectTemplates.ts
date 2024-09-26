import { Kysely } from 'kysely'
import { TemplatesInsert } from '@/modules/templates/repository'
import { templates } from '../data/templateData'

export const timestamp = new Date('20240925110448Z')

const templatesData: TemplatesInsert[] = [...templates]

export async function up(db: Kysely<any>): Promise<void> {
  await db.insertInto('templates').values(templatesData).execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('templates').execute()
}
