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
import { CLASSIFICATION, OBJECT_DETECTION, SEGMENTATION } from '../../../common/constants'
import { deserialize } from '../../../hooks/deserialize/deserializeFunction'
import { CONNECTION_DESTINATION, SERVICE } from '../../../common/settings'
import * as getLocalStorage from '../../../hooks/getLocalStorage'

/**
 * Uses get inference data, and deserialize
 *
 * @param aiTask The model of the used AI model type.
 *
 * @returns an object. Ex: [{"1":{...}, "2"{...}, ...,}]
 */
const getLatestInferenceResults = async (aiTask: string) => {
  let response
  if (CONNECTION_DESTINATION.toString() === SERVICE.Local) {
    const RETRY_COUNT = 5
    response = await getLocalStorage.getLatestInferenceFromLocal(RETRY_COUNT)
  }
  const errorMsg = 'Cannot get inferences.'
  if (!response || response?.length === 0) {
    throw new Error(JSON.stringify({ message: errorMsg }))
  }

  try {
    const deserializedList = await deserialize(response[0].Inferences[0].O, aiTask)
    const deserializedRawData = response[0]
    if (deserializedList !== undefined) {
      if (aiTask === OBJECT_DETECTION || aiTask === CLASSIFICATION) {
        deserializedRawData.Inferences[0].O = deserializedList
      } else if (aiTask === SEGMENTATION) {
        const T = deserializedRawData.Inferences[0].T
        deserializedRawData.Inferences[0] = { T, ...deserializedList }
      }
      const copyRawData = JSON.parse(JSON.stringify(deserializedRawData))
      const inferences = {
        deserializedRawData,
        inference_result: {
          Inferences: []
        }
      }
      const Inferences = copyRawData.Inferences
      inferences.inference_result.Inferences = Inferences
      return inferences
    }
  } catch (e) {
    throw new Error(JSON.stringify({ message: 'The specified AITask and data AITask may not match.\rPlease check the specified AITask.' }))
  }
}

/**
 * Obtain and return the latest inference results stored in Local Storage.
 *
 * @param req Request
 * aiTask: Specify the AI model used  ex.'objectDetection'
 *
 * @param res Response
 * inferencesList: Get inference contents data (after deserialize)
 *
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests.' })
    return
  }
  const aiTask: string | undefined = req.query.aiTask?.toString()
  if (aiTask === undefined) {
    throw new Error(JSON.stringify({ message: 'Some parameter is undefined.' }))
  } else {
    if (aiTask !== OBJECT_DETECTION && aiTask !== CLASSIFICATION && aiTask !== SEGMENTATION) {
      res.status(400).json('Only objectDetection or classification or segmentation.')
      return
    }
    await getLatestInferenceResults(aiTask)
      .then((result) => {
        const response = {
          deserializedRawData: result?.deserializedRawData,
          inference: result?.inference_result
        }
        return res.status(200).json(response)
      }).catch(err => {
        return res.status(500).json(err.message)
      })
  }
}
