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
import { getImage } from '../../../hooks/getStorageData'

/**
 * Uses Console to get number of files in subdirectories
 *
 * @param deviceId The id of the device to get uploading image data.
 * @param subDirectory The Subdirectory where the acquired inferred source images are stored.
 * @returns Number of images in subdirectories Ex: 20
 */
const totalImageCount = async (deviceId: string, subDirectory: string) => {
  const numberOfImages = 1
  const result = await getImage(deviceId, subDirectory, undefined, undefined, numberOfImages)
  return result?.total_image_count
}

/**
 * Get image data as defined by the query parameter.
 *
 * @param req Request
 * deviceId: DeviceID of the edge AI device uploading the inference source image
 * subDirectory: Subdirectory selected from the subdirectory list
 *
 * @param res Response
 * totalImageCountObj: Number object of inference source images saved in the selected subdirectory
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests.' })
    return
  }
  const deviceId: string | undefined = req.query.deviceId?.toString()
  const subDirectory: string | undefined = req.query.subDirectory?.toString()

  if (deviceId === undefined || subDirectory === undefined) {
    throw new Error(JSON.stringify({ message: 'Some parameter is undefined.' }))
  } else {
    await totalImageCount(deviceId, subDirectory)
      .then((result: number) => {
        const totalImageCountObj = { totalImageCount: result }
        res.status(200).json(totalImageCountObj)
      }).catch(err => {
        res.status(500).json(err.message)
      })
  }
}
