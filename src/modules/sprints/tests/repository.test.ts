import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import buildRepository, { SprintSelect, SprintsRepository } from '../repository'
import * as fixtures from './fixtures'

const db = await createTestDatabase()

const repository: SprintsRepository = buildRepository(db)

const createSprint = createFor(db, 'sprints')

let testSprintCode: string
let expectedSprint: SprintSelect

beforeAll(async () => {
  await db.deleteFrom('sprints').execute()
  const [sprint] = await createSprint(fixtures.sprints)

  testSprintCode = sprint.sprintCode
  expectedSprint = sprint
})

describe('Queries for template table', () => {
  test('should get all sprints', async () => {
    const allSprints = await repository.getSprints()
    expect(allSprints.length).toBe(3)
  })

  test('should get sprint by sprint code', async () => {
    const sprintByCode = await repository.getSprints({sprintCode: testSprintCode})
    expect(sprintByCode[0]).toEqual(expectedSprint)
  })

  test('should add new sprint', async () => {
    const newSprint = { sprintCode: 'N-1', fullTitle: 'New title' }
    const insertedSprint = await repository.insertSprint(newSprint)
    const allSprints = await repository.getSprints()
    expect(allSprints.length).toBe(4)
    expect(insertedSprint).toEqual(newSprint)
  })

  test('should update sprint by sprint code', async () => {
    const updateSprint = {
      sprintCode: testSprintCode,
      fullTitle: 'Updated title for sprint',
    }
    const updatedSprint = await repository.updateSprint(updateSprint)
    expect(updatedSprint).toEqual(updateSprint)
  })

  test('should delete sprint', async () => {
    const deleteResult = await repository.deleteSprint(testSprintCode)
    const allSprints = await repository.getSprints()
    expect(allSprints.length).toBe(3)
    expect(deleteResult).toHaveProperty('numDeletedRows')
  })
})

afterAll(async () => {
  await db.deleteFrom('sprints').execute()
})
