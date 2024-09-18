import fs from 'fs/promises'
import * as path from 'path'
import { fileURLToPath } from 'node:url'

const MIGRATIONS_PATH = './migrations'

// Function to generate a timestamp
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

// Get the migration name from command-line arguments
const migrationName = process.argv[2]

if (!migrationName) {
  throw new Error('Please provide a migration name.')
}

// Create the filename with the timestamp
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
// Path to the migrations folder (customize this as per your project structure)
const dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsFolder = path.join(dirname, MIGRATIONS_PATH)

// Create the migrations folder if it doesn't exist
async function createMigrationsFolder() {
  try {
    // Check if the folder exists by trying to access it
    await fs.access(migrationsFolder)
  } catch (err) {
    // If it doesn't exist, create it
    await fs.mkdir(migrationsFolder, { recursive: true })
  }
}

async function createMigration(): Promise<void> {
  try {
    // Ensure the migrations folder exists
    await createMigrationsFolder()

    // Define the full file path
    const filePath = path.join(migrationsFolder, fileName)

    // Create the migration file without adding content (empty file)
    await fs.writeFile(filePath, MIGRATION_BOILERPLATE)
  } catch (err) {
    if (err instanceof Error)
      throw new Error('Error creating migration file:', err)
  }
}

createMigration()
