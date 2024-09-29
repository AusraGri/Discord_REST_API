import { createMigration } from '@/utils/createMigration'
import { createFileOperations } from '@/utils/fileOperations'

const MIGRATIONS_PATH = '../database/migrations'

const fileOps = createFileOperations()

createMigration(fileOps, MIGRATIONS_PATH)