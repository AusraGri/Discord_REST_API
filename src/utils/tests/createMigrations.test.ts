// createMigration.test.ts
import { Mock } from 'vitest'
import * as path from 'path'
import { createMigration } from '../createMigration'
import Logger from '@/utils/errors/ErrorLogger'
import { createFileOperations } from '../fileOperations'

vi.mock('../fileOperations', () => ({
  createFileOperations: () => ({
    access: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  }),
}))

describe('createMigration', () => {
  const mockFileOps = createFileOperations()
  const migrationsDir = './migrations'
  const projectDir = process.cwd()
  const expectedMigrationsDir = path.resolve(
    `${projectDir}/src/utils`,
    migrationsDir
  )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should create a migration file with boilerplate', async () => {
    const migrationName = 'my_migration'
    process.argv[2] = migrationName

    await createMigration(mockFileOps, migrationsDir, true)

    const expectedFileName = `${migrationName}.ts`

    expect(mockFileOps.mkdir).not.toHaveBeenCalled()
    expect(mockFileOps.access).toHaveBeenCalledWith(expectedMigrationsDir)

    expect(mockFileOps.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(expectedFileName),
      expect.stringContaining("import { Kysely } from 'kysely'")
    )
  })

  test('should create the directory if it does not exist', async () => {
    const mockedFileAccess = mockFileOps.access as Mock

    mockedFileAccess.mockRejectedValue(new Error('Directory does not exist'))

    await createMigration(mockFileOps, migrationsDir, true)

    expect(mockFileOps.mkdir).toHaveBeenCalledWith(
      expect.stringContaining(expectedMigrationsDir),
      { recursive: true }
    )
  })

  test('should log an error if no migration name is provided', async () => {
    delete process.argv[2]

    const logErrorMock = vi.spyOn(Logger, 'error').mockImplementation(() => {})

    await createMigration(mockFileOps, migrationsDir, true)

    expect(logErrorMock).toHaveBeenCalledWith(
      'Please provide a migration name.'
    )
    logErrorMock.mockRestore()
  })

  test('should not write the file if boilerplate is false', async () => {
    const migrationName = 'my_migration'
    process.argv[2] = migrationName

    await createMigration(mockFileOps, migrationsDir, false)

    const expectedFileName = `${new Date().toISOString().split('T')[0]}-${migrationName}.ts`

    expect(mockFileOps.writeFile).not.toHaveBeenCalledWith(
      expect.stringContaining(expectedFileName),
      expect.stringContaining("import { Kysely } from 'kysely'")
    )
  })

  test('should log an error if creating the migration fails', async () => {
    const migrationName = 'my_migration'
    process.argv[2] = migrationName

    const logErrorMock = vi.spyOn(Logger, 'error').mockImplementation(() => {})

    const mockedFileWrite = mockFileOps.writeFile as Mock
    mockedFileWrite.mockRejectedValue(new Error('Write failed'))

    await createMigration(mockFileOps, migrationsDir, true)

    expect(logErrorMock).toHaveBeenCalledWith(
      expect.stringContaining('Write failed')
    )

    logErrorMock.mockRestore()
  })
})
