/*
 * Copyright 2023 Sony Semiconductor Solutions Corp. All rights reserved.
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
import { WORK_DIR } from '../../../hooks/fileUtil'
import * as path from 'path'
import * as fs from 'fs'

/**
 * Create Directory.
 *
 * @param createDirPath The directory path want to create.
 */
function createDirectory (deviceId: string, subDirectory: string) {
  try {
    deleteDirectory(WORK_DIR)
    const createDirPath = path.join(WORK_DIR, deviceId, subDirectory)
    if (!fs.existsSync(createDirPath)) {
      fs.mkdirSync(createDirPath, { recursive: true })
      console.log(`${createDirPath} created successfully`)
    }
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Fail to create Work Folder.' }))
  }
}

/**
 * Delete Directory.
 *
 * @param dirPath The directory path want to delete.
 *
 */
function deleteDirectory (dirPath: string) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true })
    }
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Fail to delete Work Folder.' }))
  }
}

/**
 * Create Directory by the query parameter.
 *
 * @param req Request
 * deviceId: edge AI device ID
 * subDirectory: image data's subdirectory name.
 *
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests.' })
    return
  }
  try {
    const deviceId: string | undefined = req.query.deviceId?.toString()
    const subDirectory: string | undefined = req.body.subDirectory?.toString()

    if (deviceId === undefined || subDirectory === undefined) {
      throw new Error(JSON.stringify({ message: 'Some parameter is undefined.' }))
    } else {
      createDirectory(deviceId, subDirectory)
      res.status(200).end()
    }
  } catch (err: any) {
    res.status(500).json(err.message)
  }
}
