/*
 * Copyright 2024 Sony Semiconductor Solutions Corp. All rights reserved.
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
import { checkExt } from '../../../hooks/fileUtil'
import { CONNECTION_DESTINATION, SERVICE } from '../../../common/settings'
import * as getLocalStorage from '../../../hooks/getLocalStorage'

/**
 * Uses get inference data, and deserialize
 *
 * @param timestamp The time of the inference data is retrieved.
 *
 * @returns an object. Ex: [{"1":{...}, "2"{...}, ...,}]
 */
const getBlob = async (timestamp: string) => {
  let response
  if (CONNECTION_DESTINATION.toString() === SERVICE.Local) {
    const RETRY_COUNT = 5
    response = await getLocalStorage.getSpecifiedImageFromLocal(RETRY_COUNT, timestamp)
  }
  const errorMsg = 'Cannot get JPG image.'
  try {
    if (!response || response.images.length === 0) {
      throw new Error(JSON.stringify({ message: errorMsg }))
    }
    checkExt(response.images[0].name)
  } catch (e) {
    console.log(e)
    throw new Error(JSON.stringify({ message: errorMsg }))
  }
  const latestImage = response?.images[0]
  const result = {
    buff: latestImage.contents
  }
  return result
}

/**
 * Get the latest image data defined by the query parameters.
 *
 * @param req Request
 * timestamp: used filter on data related to the image
 *
 * @param res Response
 * inferencesList:get inference contents data (after deserialize)
 *
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests.' })
    return
  }
  const timestamp: string | undefined = req.query.timestamp?.toString()

  if (timestamp === undefined) {
    throw new Error(JSON.stringify({ message: 'Timestamp is undefined.' }))
  } else {
    await getBlob(timestamp)
      .then((result) => {
        return res.status(200).json(result)
      }).catch(err => {
        return res.status(500).json(err.message)
      })
  }
}
