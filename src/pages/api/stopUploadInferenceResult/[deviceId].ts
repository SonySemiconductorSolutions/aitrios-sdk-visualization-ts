/*
 * Copyright 2022, 2023 Sony Semiconductor Solutions Corp. All rights reserved.
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

import type { NextApiRequest, NextApiResponse } from 'next'
import { CONNECTION_DESTINATION, LOCAL_ROOT, SERVICE } from '../../../common/settings'
import * as fs from 'fs'
import * as path from 'path'
import { isRelativePath, isStoragePathFile } from '../../../hooks/fileUtil'
import { getConsoleService } from '../../../hooks/getConsoleStorage'

/**
 * Uses Console to request that a Edge Device stop uploading inference data
 *
 * @param deviceId The id of the Edge Device to request that it stops uploading inference data.
 * @param subdirectory The Subdirectory where the acquired inferred source images are stored.
 * @returns an object containing information on whether or not the operation succeeded. Ex: { "result": "SUCCESS" } or { "result": "ERROR", "code": ..., "message": ..., "time": ... }
 */
const stopUploadInferenceResult = async (deviceId: string, subDirectory: string) => {
  if (CONNECTION_DESTINATION.toString() === SERVICE.Local) {
    isStoragePathFile(LOCAL_ROOT)
    const checkImageDir = path.join(LOCAL_ROOT, 'image')
    const checkMetaDir = path.join(LOCAL_ROOT, 'meta')
    if (!fs.existsSync(checkImageDir) || !fs.existsSync(checkMetaDir)) {
      throw new Error(JSON.stringify({ message: 'No data in LocalStorage.' }))
    }
  }

  const calClient = await getConsoleService()
  const res = await calClient.deviceManagement.stopUploadInferenceResult(deviceId)
  if (typeof res.result !== 'undefined' && res.result === 'ERROR') {
    throw new Error(JSON.stringify({ message: res.message }))
  }
  if (typeof res.data.result !== 'undefined' && res.data.result === 'WARNING') {
    throw new Error(JSON.stringify({ message: res.data.message }))
  }

  if (CONNECTION_DESTINATION.toString() === SERVICE.Local) {
    isRelativePath(LOCAL_ROOT)

    const imageTargetDir = path.join(LOCAL_ROOT, deviceId, 'image', subDirectory)
    const inferenceTargetDir = path.join(LOCAL_ROOT, deviceId, 'meta', subDirectory)
    if (!fs.existsSync(imageTargetDir)) {
      fs.mkdirSync(imageTargetDir, { recursive: true })
    }
    if (!fs.existsSync(inferenceTargetDir)) {
      fs.mkdirSync(inferenceTargetDir, { recursive: true })
    }

    const imageSourceDir = path.join(LOCAL_ROOT, 'image')
    const inferenceSourceDir = path.join(LOCAL_ROOT, 'meta')
    const imagesFiles = fs.readdirSync(imageSourceDir)
    for (const fileName of imagesFiles) {
      const sourceFilePath = path.join(imageSourceDir, fileName)
      const targetFileDir = path.join(imageTargetDir, fileName)
      fs.renameSync(sourceFilePath, targetFileDir)
    }

    const inferenceFiles = fs.readdirSync(inferenceSourceDir)
    for (const fileName of inferenceFiles) {
      const sourceFilePath = path.join(inferenceSourceDir, fileName)
      const targetFileDir = path.join(inferenceTargetDir, fileName)
      fs.renameSync(sourceFilePath, targetFileDir)
    }
  }

  return res.data
}

/**
 * Request that a Edge Device stop uploading inference data.
 *
 * @param req Request
 * deviceId: Edge Device ID
 * subDirectory: image and inference data's subdirectory name.
 *
 * @param res Response
 * result: execution result
 *
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests.' })
    return
  }
  const deviceId: string | undefined = req.query.deviceId?.toString()
  const subDirectory: string = req.body.subDirectory.toString()

  if (deviceId === undefined || subDirectory === undefined) {
    throw new Error(JSON.stringify({ message: 'Some parameter is undefined.' }))
  } else {
    await stopUploadInferenceResult(deviceId, subDirectory)
      .then(result => {
        res.status(200).json(result)
      }).catch(err => {
        res.status(500).json(err.message)
      })
  }
}
