import fs from 'fs/promises'
import { createFileOperations } from '../fileOperations'

describe('FileOperations', () => {
  let fileOps: ReturnType<typeof createFileOperations>

  beforeEach(() => {
    vi.clearAllMocks()
    fileOps = createFileOperations()
  })

  test('should call fs.access when access is invoked', async () => {
    const accessSpy = vi.spyOn(fs, 'access').mockResolvedValue(undefined)

    const path = '/path/to/file'
    await fileOps.access(path)

    expect(accessSpy).toHaveBeenCalledWith(path)
    expect(accessSpy).toHaveBeenCalledTimes(1)
  })

  test('should call fs.mkdir with recursive option', async () => {
    const mkdirSpy = vi.spyOn(fs, 'mkdir').mockResolvedValue(undefined)

    const path = '/path/to/directory'
    const options = { recursive: true }
    await fileOps.mkdir(path, options)

    expect(mkdirSpy).toHaveBeenCalledWith(path, options)
    expect(mkdirSpy).toHaveBeenCalledTimes(1)
  })

  test('should call fs.writeFile with correct path and data', async () => {
    const writeFileSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined)

    const path = '/path/to/file'
    const data = 'file contents'
    await fileOps.writeFile(path, data)

    expect(writeFileSpy).toHaveBeenCalledWith(path, data)
    expect(writeFileSpy).toHaveBeenCalledTimes(1)
  })

  test('should handle fs.access throwing an error', async () => {
    const accessSpy = vi
      .spyOn(fs, 'access')
      .mockRejectedValue(new Error('access denied'))

    const path = '/path/to/file'

    await expect(fileOps.access(path)).rejects.toThrow('access denied')
    expect(accessSpy).toHaveBeenCalledTimes(1)
  })

  test('should handle fs.mkdir throwing an error', async () => {
    const mkdirSpy = vi
      .spyOn(fs, 'mkdir')
      .mockRejectedValue(new Error('mkdir failed'))

    const path = '/path/to/directory'
    const options = { recursive: true }

    await expect(fileOps.mkdir(path, options)).rejects.toThrow('mkdir failed')
    expect(mkdirSpy).toHaveBeenCalledTimes(1)
  })

  test('should handle fs.writeFile throwing an error', async () => {
    const writeFileSpy = vi
      .spyOn(fs, 'writeFile')
      .mockRejectedValue(new Error('write failed'))

    const path = '/path/to/file'
    const data = 'file contents'

    await expect(fileOps.writeFile(path, data)).rejects.toThrow('write failed')
    expect(writeFileSpy).toHaveBeenCalledTimes(1)
  })
})
