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

import type { NextApiRequest, NextApiResponse } from 'next'
import { getZipFileName } from '../../../hooks/fileUtil'
import * as fs from 'fs'

export const config = {
  api: {
    responseLimit: false
  }
}

/**
 * Get zip data.
 *
 * @param req Request
 * @param res Response
 *
 */

export default function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests.' })
    return
  }
  try {
    const zipFilePath = getZipFileName()
    const chunkSize = 1024
    const stat = fs.statSync(zipFilePath)
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': 'application/zip'
    })
    const readStream = fs.createReadStream(zipFilePath, { highWaterMark: chunkSize })
    readStream.pipe(res)
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Failed get zip data.' })
  }
}
