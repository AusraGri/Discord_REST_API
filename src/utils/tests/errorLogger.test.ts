// logger.test.ts
import Logger from '../errors/ErrorLogger'

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call process.stderr.write with the correct error message', () => {
    const errorMessage = 'Error message'
    Logger.error(errorMessage)

    expect(process.stderr.write).toHaveBeenCalledWith(
      `\n[ERROR]: ${errorMessage}\n`
    )
  })

  it('should call process.stdout.write with the correct info message', () => {
    const infoMessage = 'Information message'
    Logger.info(infoMessage)

    expect(process.stdout.write).toHaveBeenCalledWith(
      `\n[INFO]: ${infoMessage}\n`
    )
  })
})
