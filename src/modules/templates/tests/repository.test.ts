import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import buildRepository, { TemplatesRepository } from '../repository'

const db = await createTestDatabase()

const repository: TemplatesRepository = buildRepository(db)
const createTemplate = createFor(db, 'templates')

beforeAll(async () => {
  await createTemplate([
    { text: 'congratulations1!' },
    { text: 'congratulations2!' },
    { text: 'congratulations3!' },
  ])
})

describe('Queries for template table', () => {
  test('should get all templates', async () => {
    const allTemplates = await repository.getTemplates()
    expect(allTemplates.length).toBe(3)
  })

  test('should find templates by template id', async () => {
    const templateId = 1
    const templateById = await repository.getTemplates({id: templateId})
    const expectedTemplate = { id: 1, text: 'congratulations1!' }

    expect(templateById.length).toBe(1)
    expect(templateById[0]).toEqual(expectedTemplate)
  })

  test('should limit amount of templates to get', async () => {
    const templateLimit = 2
    const limitedTemplates = await repository.getTemplates( {limit: templateLimit})
    expect(limitedTemplates.length).toBe(2)
  })

  test('should ignore limit of zero', async () => {
    const templateLimit = 0
    const limitedTemplates = await repository.getTemplates( {limit: templateLimit})
    expect(limitedTemplates.length).toBe(3)
  })

  test('should return empty array if template by id is not found', async () => {
    const templateId = 0
    const limitedTemplates = await repository.getTemplates( {id: templateId})
    expect(limitedTemplates.length).toBe(0)
  })
})

afterAll(async () => {
  await db.deleteFrom('templates').execute()
})
