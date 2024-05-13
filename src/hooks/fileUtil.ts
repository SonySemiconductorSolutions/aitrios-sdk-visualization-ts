/*
 * Copyright 2023, 2024 Sony Semiconductor Solutions Corp. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'fs'
import * as path from 'path'
import { zipSync, Zippable } from 'fflate'
import { segStringify } from './util'

export const WORK_DIR = 'work'

export function saveImage (imageData: any, subDirPath: string) {
  try {
    const { name, contents } = imageData
    const saveFilePath = path.join(subDirPath, name)
    createImageFile(saveFilePath, contents)
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Fail to save Image file.' }))
  }
}

export function saveInference (inferenceData: string, saveDirPath: string, timestamp: string) {
  const name = timestamp + '.json'
  const saveFilePath = path.join(saveDirPath, name)
  try {
    createInferencesFile(saveFilePath, inferenceData)
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Fail to save Inference file.' }))
  }
}

function removeExtension (str: string) {
  let convertedStr = str
  try {
    if (str.indexOf('.') !== -1) {
      convertedStr = str.substring(0, str.indexOf('.'))
    }
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Fail to remove file extension.' }))
  }
  return convertedStr
}

function createImageFile (filePath: string, imageData: string) {
  try {
    fs.writeFileSync(filePath, imageData, { encoding: 'base64' })
  } catch (err) {
    console.error((err as Error).message)
    throw new Error(JSON.stringify({ message: 'Fail to create Image file.' }))
  }
}

function createInferencesFile (filePath: string, inferenceData: any) {
  try {
    fs.writeFileSync(filePath, segStringify(inferenceData))
  } catch (err) {
    console.error((err as Error).message)
    throw new Error(JSON.stringify({ message: 'Fail to create Inference file.' }))
  }
}

export const createZipFile = async (zipDirPath: string, zipFileName: string, subDirectory: string) => {
  try {
    const target: Zippable = {}
    readFiles(target, zipDirPath, subDirectory)

    const zipData = zipSync(target)
    fs.writeFileSync(zipFileName, zipData)

    console.log(`${zipFileName} created successfully`)
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Failed create zip file.' }))
  }
}

export const getZipFileName = () => {
  const fileName = fs.readdirSync(WORK_DIR)[0]
  const filePath = path.join(WORK_DIR, fileName)
  return filePath
}

const readFiles = (files: Zippable, targetPath: string, saveDir: string) => {
  const list = fs.readdirSync(targetPath)

  list.forEach((flieName) => {
    const filePath = path.join(targetPath, flieName)
    if (fs.statSync(filePath).isDirectory()) {
      readFiles(files, filePath, path.join(saveDir, flieName))
    } else {
      files[path.join(saveDir, flieName)] = fs.readFileSync(filePath)
    }
  })
}

export const getTimestampFromImageFileName = (dir: string) => {
  try {
    const fileNameList = fs.readdirSync(dir)
    const imgFileNames = fileNameList
      .filter(file => path.extname(file) === '.jpg')
      .map(file => removeExtension(file))
    return imgFileNames
  } catch (e) {
    throw new Error(JSON.stringify({ message: 'Fail to get timestamp list.' }))
  }
}

export function isRelativePath (storagePath: string) {
  if (!path.isAbsolute(storagePath)) {
    throw new Error(JSON.stringify({ message: 'Only absolute paths are supported.' }))
  }
  return true
}

export function isSymbolicLinkFile (path: string) {
  if (fs.lstatSync(path).isSymbolicLink()) {
    throw new Error(JSON.stringify({ message: 'Can\'t open symbolic link file.' }))
  }
  return true
}

export function isStoragePathFile (path: string) {
  try {
    fs.statSync(path)
    return true
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Data does not exist.' }))
  }
}

export function isFile (filePath: string) {
  if (!fs.existsSync(filePath)) {
    const fileName = path.basename(filePath)
    throw new Error(JSON.stringify({ message: `${fileName} file is not exist.` }))
  }
  return true
}

export function checkExt (filePath: string) {
  if (path.extname(filePath) === '.jpg') {
    return true
  } else {
    throw new Error()
  }
}
