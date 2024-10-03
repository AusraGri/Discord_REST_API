import createApp from '@/app'
import createDatabase from '@/database'
import Logger from '@/utils/errors/ErrorLogger'
import { DATABASE_URL, GIPHY_API_KEY } from '@/config/config'
import buildImagesManager from '@/modules/images/fetchImages'
import fetchAndStoreImages from '@/modules/images'

vi.mock('dotenv/config')

vi.mock('@/app', () => ({
  default: vi.fn(),
}))

vi.mock('@/database', () => ({
  default: vi.fn(),
}))

vi.mock('@/utils/errors/ErrorLogger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/config/config', () => ({
  DATABASE_URL: 'mock-database-url',
  GIPHY_API_KEY: 'mock-giphy-api-key',
}))

vi.mock('@/modules/images/fetchImages', () => ({
  default: vi.fn(),
  buildImagesManager: vi.fn(),
}))

vi.mock('@/modules/images', () => ({
  default: vi.fn(),
}))

describe('index.ts', () => {
  const mockDatabase = {}
  const mockApp = { listen: vi.fn() }
  const mockImagesManager = {}

  beforeEach(() => {
    vi.clearAllMocks()
    ;(createDatabase as any).mockReturnValue(mockDatabase)
    ;(createApp as any).mockReturnValue(mockApp)
    ;(buildImagesManager as any).mockReturnValue(mockImagesManager)
    ;(fetchAndStoreImages as any).mockResolvedValue(undefined)
  })

  test('should start the server successfully and log success messages', async () => {
    await import('@/index')
    expect(createDatabase).toHaveBeenCalledWith(DATABASE_URL)
    expect(createApp).toHaveBeenCalledWith(mockDatabase)
    expect(buildImagesManager).toHaveBeenCalledWith(GIPHY_API_KEY)
    expect(fetchAndStoreImages).toHaveBeenCalledWith(
      mockDatabase,
      mockImagesManager
    )

    const listenCallback = mockApp.listen.mock.calls[0][1]
    listenCallback()

    expect(Logger.info).toHaveBeenNthCalledWith(
      1,
      'Images fetched and stored in the database successfully.'
    )
    expect(Logger.info).toHaveBeenNthCalledWith(
      2,
      'Server is running at http://localhost:3001'
    )

    expect(mockApp.listen).toHaveBeenCalledWith(3001, expect.any(Function))
  })

  test('should log an error and exit if fetching images fails', async () => {
    const mockError = new Error('Fetching images failed')

    ;(fetchAndStoreImages as ReturnType<typeof vi.fn>).mockRejectedValue(
      mockError
    )

    const mockLoggerError = vi.spyOn(Logger, 'error')

   const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: string | number | null | undefined) => {
    Logger.info(`process.exit called with code: ${code}`)
  }) as (code?: string | number | null | undefined) => never)

  vi.resetModules()

  await import('@/index') 

  expect(mockLoggerError).toHaveBeenCalledWith(
    'Error during server startup: Fetching images failed'
  )

    expect(mockLoggerError).toHaveBeenCalledWith(
      'Error during server startup: Fetching images failed'
    )

    expect(processExitSpy).toHaveBeenCalledWith(1)

    mockLoggerError.mockRestore()
    processExitSpy.mockRestore()
  })
})
