import * as path from 'path'
import { fileURLToPath } from 'node:url'
import Logger from '@/utils/errors/ErrorLogger'
import { FileOperations, createFileOperations } from './fileOperations'

const MIGRATIONS_PATH = '../database/migrations'

const fileOperations = createFileOperations()

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

export async function createMigration(
  fileOps: FileOperations,
  migrationsDir: string,
  boilerplate = true
): Promise<void> {
  const migrationName = process.argv[2]

  if (!migrationName) {
    Logger.error('Please provide a migration name.')
    return
  }

  const timestamp = getTimestamp()
  const fileName = `${timestamp}-${migrationName}.ts`
  const dirname = path.dirname(fileURLToPath(import.meta.url))
  const migrationsFolder = path.join(dirname, migrationsDir)

  try {
    await fileOps.access(migrationsFolder)
  } catch {
    await fileOps.mkdir(migrationsFolder, { recursive: true })
  }

  const filePath = path.join(migrationsFolder, fileName)

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

  if (boilerplate) {
    try {
      await fileOps.writeFile(filePath, MIGRATION_BOILERPLATE)
    } catch (error) {
      const { message } = error as Error
      Logger.error(message)
    }
  }
}

createMigration(fileOperations, MIGRATIONS_PATH)
