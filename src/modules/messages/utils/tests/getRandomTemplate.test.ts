import { describe, it, expect, vi } from 'vitest'
import getRandomTemplate from '../getRandomTemplate'
import { Database } from '@/database'
import buildTemplatesRepository from '@/modules/templates/repository'

vi.mock('@/modules/templates/repository', () => ({
  default: vi.fn(),
}))

describe('getRandomTemplate', () => {
  const mockDb = {} as Database

  it('should return a random template from the available templates', async () => {
    const mockTemplates = [
      { id: 1, name: 'Template 1' },
      { id: 2, name: 'Template 2' },
      { id: 3, name: 'Template 3' },
    ]

    const mockGetTemplates = vi.fn().mockResolvedValue(mockTemplates)
    ;(buildTemplatesRepository as any).mockReturnValue({
      getTemplates: mockGetTemplates,
    })

    const result = await getRandomTemplate(mockDb)

    expect(mockTemplates).toContain(result)
    expect(mockGetTemplates).toHaveBeenCalledTimes(1)
  })

  it('should throw an error if there are no templates available', async () => {
    const mockGetTemplates = vi.fn().mockResolvedValue([])
    ;(buildTemplatesRepository as any).mockReturnValue({
      getTemplates: mockGetTemplates,
    })

    await expect(getRandomTemplate(mockDb)).rejects.toThrow(
      'No templates available'
    )

    expect(mockGetTemplates).toHaveBeenCalledTimes(1)
  })
})
