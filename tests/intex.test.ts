import createApp from '@/app'
import createDatabase from '@/database'
import Logger from '@/utils/errors/ErrorLogger'
import { DATABASE_URL, GIPHY_API_KEY } from '@/config/config'
import buildImagesManager from '@/modules/images/fetchImages'
import fetchAndStoreImages from '@/modules/images'

// Mocking all the external dependencies
vi.mock('dotenv/config')

vi.mock('@/app', () => ({
  default: vi.fn()
}))

vi.mock('@/database', () => ({
  default: vi.fn()
}))

vi.mock('@/utils/errors/ErrorLogger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('@/config/config', () => ({
  DATABASE_URL: 'mock-database-url',
  GIPHY_API_KEY: 'mock-giphy-api-key'
}))

vi.mock('@/modules/images/fetchImages', () => ({
  default: vi.fn(),
  buildImagesManager: vi.fn()
}))

vi.mock('@/modules/images', () => ({
    default: vi.fn(),
  }))

describe('index.ts', () => {

  const mockDatabase = { /* your mock database object */ }
  const mockApp = { listen: vi.fn() }
  const mockImagesManager = {}

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mocks before each test
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
    expect(fetchAndStoreImages).toHaveBeenCalledWith(mockDatabase, mockImagesManager)

   // Simulate the app.listen callback being invoked
  const listenCallback = mockApp.listen.mock.calls[0][1]
  listenCallback() // Manually trigger the callback

  // Check the order of Logger.info calls
  expect(Logger.info).toHaveBeenNthCalledWith(1, 'Images fetched and stored in the database successfully.')
  expect(Logger.info).toHaveBeenNthCalledWith(2, 'Server is running at http://localhost:3000')

  // Check that the server starts
  expect(mockApp.listen).toHaveBeenCalledWith(3000, expect.any(Function))
  })

//   it('should log an error and exit if fetching images fails', async () => {
//     const mockError = new Error('Fetching images failed');
  
//     // Mock fetchAndStoreImages to reject with an error
//     (fetchAndStoreImages as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

  
//     // Mock Logger.error
//     const mockLoggerError = vi.spyOn(Logger, 'error');
  
//     // Mock process.exit
//     const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
//       throw new Error('process.exit called');
//     });
  
//     // Clear the module cache for 'index.ts' to re-execute the IIFE
//     const modulePath = require.resolve('@/index'); // Ensure this path is correct
//     delete require.cache[modulePath];
  
//     // Import the index module which triggers the server startup
//     try {
//       await import('@/index'); // Use the alias
//     } catch (e) {
//       // Handle the error (if any) that occurs from process.exit
//       console.log('Caught in test:', e);
//     }
  
//     // Check Logger.error calls
//     expect(mockLoggerError).toHaveBeenCalledWith('Error during server startup: Fetching images failed');
  
//     // Assert process.exit was called with code 1
//     expect(processExitSpy).toHaveBeenCalledWith(1);
  
//     // Restore mocks
//     mockLoggerError.mockRestore();
//     processExitSpy.mockRestore();
//   });
  
})