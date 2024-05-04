import { unlink } from 'fs'

export const deleteFileFs = (filePath, callback) => {
  unlink(filePath, callback)
}
