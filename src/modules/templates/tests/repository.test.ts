import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import cleanDatabase from '@tests/utils/createTestDatabase/cleanDatabase'
import buildRepository, { TemplatesRepository } from '../repository'

const db = await createTestDatabase()

const repository: TemplatesRepository = buildRepository(db)
const createTemplate = createFor(db, 'templates')

let templateId: number

beforeAll(async () => {
  await cleanDatabase(db)
  const [template] = await createTemplate([
    { text: 'congratulations1!' },
    { text: 'congratulations2!' },
    { text: 'congratulations3!' },
  ])

  templateId = template.id
})

describe('Queries for template table', () => {
  test('should get all templates', async () => {
    const allTemplates = await repository.getTemplates()
    expect(allTemplates.length).toBe(3)
  })

  test('should find templates by template id', async () => {
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
    const invalidId = 0
    const limitedTemplates = await repository.getTemplates( {id: invalidId})
    expect(limitedTemplates.length).toBe(0)
  })

  test('should add new template', async () => {
    const newTemplate = {text: 'New template'}
    const template = await repository.insertTemplate( newTemplate)
    const allTemplates = await repository.getTemplates()
    expect(allTemplates.length).toBe(4)
    expect(template).toHaveProperty('text', 'New template')

  })

  test('should update template text', async () => {
    const updatedTemplate = {id: templateId, text: 'Updated text'}
    const template = await repository.patchTemplate( updatedTemplate)
    expect(template).toEqual(updatedTemplate)
  })

  test('should delete template', async () => {
    const template = await repository.deleteTemplate(templateId)
    const allTemplates = await repository.getTemplates()
    expect(allTemplates.length).toBe(3)
    expect(template).toHaveProperty('numDeletedRows')
  })

})

afterAll(async () => {
  await db.deleteFrom('templates').execute()
})
