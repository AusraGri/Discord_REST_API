import fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'node:url'
import Logger from '@/utils/errors/ErrorLogger'

const MIGRATIONS_PATH = './migrations'

function getTimestamp(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}${month}${day}${hours}${minutes}${seconds}Z`
}

const migrationName = process.argv[2]

if (!migrationName) {
  Logger.error('Please provide a migration name.')
  process.exit(0)
}

const timestamp = getTimestamp()
const fileName = `${timestamp}-${migrationName}.ts`

const MIGRATION_BOILERPLATE = `import { Kysely } from 'kysely' \n
export const timestamp = new Date('${timestamp}') \n
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('example')
    .addColumn('id', 'integer', (col) => col.primaryKey(). unique().autoIncrement())
    .execute()
}\n

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('example').execute()
} \n
`

const dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsFolder = path.join(dirname, MIGRATIONS_PATH)

async function createMigrationsFolder() {
  try {
    await fs.access(migrationsFolder)
  } catch (err) {
    await fs.mkdir(migrationsFolder, { recursive: true })
  }
}

async function createMigration(): Promise<void> {
  try {
    await createMigrationsFolder()

    const filePath = path.join(migrationsFolder, fileName)

    await fs.writeFile(filePath, MIGRATION_BOILERPLATE)
  } catch (err) {
    if (err instanceof Error)
      throw new Error('Error creating migration file:', err)
  }
}

createMigration()
