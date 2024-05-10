import { NoParamCallback, unlink } from 'fs'

export const deleteFileFs = (filePath: string, callback: NoParamCallback) => {
  unlink(filePath, callback)
}
