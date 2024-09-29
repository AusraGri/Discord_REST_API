// createMigration.test.ts
import * as path from 'path'
import { createMigration } from '../createMigration'
import { FileOperations } from '../fileOperations'

describe('createMigration', () => {

  const mockFileOps: FileOperations = {
    access: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  }

  const migrationsDir = './migrations'
  const projectDir = process.cwd()
  const expectedMigrationsDir = path.resolve(
    `${projectDir}/src/utils`,
    migrationsDir
  )

  test('should create a migration file with boilerplate', async () => {
    const migrationName = 'my_migration'
    process.argv[2] = migrationName

    await createMigration(mockFileOps, migrationsDir, true)

    const expectedFileName = `${migrationName}.ts`

    expect(mockFileOps.mkdir).not.toHaveBeenCalled()
    expect(mockFileOps.access).toHaveBeenCalledWith(expectedMigrationsDir)

    expect(mockFileOps.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(expectedFileName),
      expect.stringContaining("import { Kysely } from 'kysely'") // Ensure the filename matches the expected format // Check if boilerplate contains this line
    )
  })

  it('should create the directory if it does not exist', async () => {
    mockFileOps.access.mockRejectedValue(new Error('Directory does not exist'))

    await createMigration(mockFileOps, migrationsDir, true)

    expect(mockFileOps.mkdir).toHaveBeenCalledWith(
      expect.stringContaining(expectedMigrationsDir),
      { recursive: true }
    )
  })

  test('should exit if no migration name is provided', async () => {
    delete process.argv[2]

    const exitMock = vi.spyOn(process, 'exit').mockImplementation((code) => {
      expect(code).toBe(0)
    })

    await createMigration(mockFileOps, migrationsDir, true)

    expect(exitMock).toHaveBeenCalled()

    exitMock.mockRestore()
  })
})
