/*
 * Copyright 2023, 2024 Sony Semiconductor Solutions Corp. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as fs from 'fs'
import * as path from 'path'
import { LOCAL_ROOT } from '../common/settings'
import { isRelativePath, isSymbolicLinkFile, isStoragePathFile } from './fileUtil'
import { setTimeout } from 'timers/promises'

type getImageFromLocalResult = {
  total_image_count: number,
  images: {
    name: string,
    contents: string
  }[]
}

type getSpecifiedImageFromLocalResult = {
  images: {
    name: string,
    contents: string
  }[]
}

const LOCAL_WAIT_TIME = 50

export async function getImageFromLocal (retryCount: number, deviceId: string, subDirectory: string, orderBy?: string, skip?: number, numberOfImages?: number): Promise<getImageFromLocalResult> {
  const response: getImageFromLocalResult = {
    total_image_count: 0,
    images: []
  }
  const storagePath = path.join(LOCAL_ROOT, deviceId, 'image', subDirectory)
  isRelativePath(storagePath)
  orderBy = orderBy || 'ASC' // ASC is cal default value
  skip = skip || 0 // 0 is cal default value
  numberOfImages = numberOfImages || 50 // 50 is cal default value
  const images: any = []
  isStoragePathFile(storagePath)
  const files = fs.readdirSync(storagePath)
  const imagesFiles = files.filter(file => {
    const extension = path.extname(file).toLowerCase()
    return extension === '.jpg'
  })
  if (orderBy === 'DESC') {
    imagesFiles.reverse()
  }
  for (let i = 0; i < numberOfImages; i++) {
    if (imagesFiles[i + skip] === undefined) {
      break
    }
    const filePath = path.join(storagePath, imagesFiles[i + skip])
    isRelativePath(filePath)
    isSymbolicLinkFile(filePath)
    const base64Image = fs.readFileSync(filePath, 'base64')
    images.push({
      name: imagesFiles[i + skip],
      contents: base64Image
    })
  }

  if (imagesFiles.length !== 0) {
    response.total_image_count = imagesFiles.length
    response.images = images
    return response
  }
  if (retryCount > 0) {
    await setTimeout(LOCAL_WAIT_TIME)
    return getImageFromLocal(retryCount - 1, deviceId, subDirectory, orderBy, skip, numberOfImages)
  }
  return response
}

export async function getSpecifiedImageFromLocal (retryCount: number, timestamp: string): Promise<getSpecifiedImageFromLocalResult> {
  const response: getSpecifiedImageFromLocalResult = {
    images: []
  }
  const images: any = []
  const fileName = timestamp + '.jpg'
  const filePath = path.join(LOCAL_ROOT, 'image', fileName)
  try {
    isStoragePathFile(filePath)
  } catch (err) {
    if (retryCount > 0) {
      await setTimeout(LOCAL_WAIT_TIME)
      return getSpecifiedImageFromLocal(retryCount - 1, timestamp)
    } else {
      throw err
    }
  }
  isRelativePath(filePath)
  isSymbolicLinkFile(filePath)
  const base64Image = fs.readFileSync(filePath, 'base64')
  images.push({
    name: fileName,
    contents: base64Image
  })

  if (images.length !== 0) {
    response.images = images
  }
  return response
}

export async function getInferenceFromLocal (retryCount: number, deviceId: string, subDirectory: string, startInferenceTime?: string, endInferenceTime?: string, numberOfInferenceResult?: number): Promise<string[]> {
  const serializeDatas: string[] = []
  const storagePath = path.join(LOCAL_ROOT, deviceId, 'meta', subDirectory)
  isRelativePath(storagePath)
  numberOfInferenceResult = numberOfInferenceResult || 20 // 20 is cal default value
  isStoragePathFile(storagePath)
  const inferencesFiles = fs.readdirSync(storagePath) // get inferences
  for (const fileName of inferencesFiles) {
    const timestamp = path.basename(fileName, '.txt')
    if ((startInferenceTime === undefined || timestamp >= startInferenceTime) &&
      (endInferenceTime === undefined || timestamp < endInferenceTime)) {
      const inferenceFilePath = path.join(LOCAL_ROOT, deviceId, 'meta', subDirectory, fileName)
      isSymbolicLinkFile(inferenceFilePath)
      const inferenceData = fs.readFileSync(inferenceFilePath, 'utf8')
      const json = JSON.parse(inferenceData)
      serializeDatas.push(json)
    } else if (endInferenceTime !== undefined && timestamp > endInferenceTime) {
      break
    }
    if (serializeDatas.length === numberOfInferenceResult) break
  }
  if (serializeDatas.length !== 0) return serializeDatas
  if (retryCount > 0) {
    await setTimeout(LOCAL_WAIT_TIME)
    return getInferenceFromLocal(retryCount - 1, deviceId, subDirectory, startInferenceTime, endInferenceTime, numberOfInferenceResult)
  }
  return serializeDatas
}

export async function getLatestInferenceFromLocal (retryCount: number): Promise<any[]> {
  const serializeDatas: string[] = []
  const storagePath = path.join(LOCAL_ROOT, 'meta')
  isRelativePath(storagePath)
  isStoragePathFile(storagePath)
  const inferencesFiles = fs.readdirSync(storagePath)
  let latestFileName: string = ''
  if (inferencesFiles.length > 0) {
    latestFileName = inferencesFiles[0]
    inferencesFiles.forEach((file) => {
      if (file.localeCompare(latestFileName, undefined, { numeric: true, sensitivity: 'base' })) {
        latestFileName = file
      }
    })
  }
  if (latestFileName !== '') {
    const inferenceData = fs.readFileSync(path.join(storagePath, latestFileName), 'utf8')
    const json = JSON.parse(inferenceData)
    serializeDatas.push(json)
    return serializeDatas
  }
  if (retryCount > 0) {
    await setTimeout(LOCAL_WAIT_TIME)
    return getLatestInferenceFromLocal(retryCount - 1)
  }
  return serializeDatas
}

export function getSubDirectoryListFromLocal (deviceId: string) {
  const storagePath = path.join(LOCAL_ROOT, deviceId, 'image')
  isRelativePath(storagePath)
  isStoragePathFile(storagePath)
  const items = fs.readdirSync(storagePath, { withFileTypes: true })
  const subDirectoryList = []
  for (const item of items) {
    subDirectoryList.push(item.name)
  }
  const response = subDirectoryList.filter((value, index, self) => {
    return self.indexOf(value) === index
  })
  return response
}
