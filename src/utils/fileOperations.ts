import fs from 'fs/promises'

export interface FileOperations {
  access(path: string): Promise<void>
  mkdir(path: string, options: { recursive: boolean }): Promise<void>
  writeFile(path: string, data: string): Promise<void>
}

export const createFileOperations = (): FileOperations => ({
  access: async (path: string) => fs.access(path).then(() => undefined),
  mkdir: (path: string, options: { recursive: boolean }) =>
    fs.mkdir(path, options) as Promise<void>,
  writeFile: (path: string, data: string) =>
    fs.writeFile(path, data) as Promise<void>,
})
