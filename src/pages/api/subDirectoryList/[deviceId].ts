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
import { getSubDirectoryList } from '../../../hooks/getStorageData'

/**
 * Uses Console to get Subdirectory of deviceId
 *
 * @param deviceId The id of the device to get uploading image data.
 *
 * @returns subDirectory list . Ex:['20220120','20220121','20220122']
 */
const getsubDirectoryList = async (deviceId: string) => {
  const response = await getSubDirectoryList(deviceId)
  return response
}

/**
 * Get image data as defined by the query parameter.
 *
 * @param req Request
 * deviceId: edge AI device ID
 *
 * @param res Response
 * subDirectory list: List of subdirectories where inference source images are stored
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests.' })
    return
  }

  const deviceId: string | undefined = req.query.deviceId?.toString()
  if (deviceId === undefined) {
    throw new Error(JSON.stringify({ message: 'Device ID is undefined.' }))
  } else {
    await getsubDirectoryList(deviceId)
      .then(result => {
        res.status(200).json(result)
      }).catch(err => {
        res.status(500).json(err.message)
      })
  }
}
