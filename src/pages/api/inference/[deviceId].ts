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
import { CLASSIFICATION, OBJECT_DETECTION, SEGMENTATION } from '../..'
import { getDateDecrement, getDateIncrement } from '../../../hooks/util'
import { deserialize } from '../../../hooks/deserialize/deserializeFunction'
import { getInference } from '../../../hooks/getStorageData'
import { CONNECTION_DESTINATION, SERVICE } from '../../../common/settings'
/**
 * Uses get inference data, and deserialize
 *
 * @param deviceId The id of the device to get uploading inference data.
 * @param subDirectory The Subdirectory where the acquired inferred source images are stored.
 * @param timestamp The time of the inference data is retrieved.
 * @param aiTask The model of the used AI model type.
 * @param mode The type of mode selected.
 *
 * @returns an object. Ex: [{"1":{...}, "2"{...}, ...,}]
 */
const getInferenceResults = async (deviceId: string, subDirectory: string, timestamp: string, aiTask: string, mode: string) => {
  if (CONNECTION_DESTINATION.toString() === SERVICE.Local && mode === 'realtimeMode') {
    deviceId = ''
    subDirectory = ''
  }
  const response = await getInference(deviceId, subDirectory, getDateDecrement(timestamp), getDateIncrement(timestamp))
  const errorMsg = 'Cannot get inferences.'
  try {
    if (response?.length === 0 || !response) {
      throw new Error(JSON.stringify({ message: errorMsg }))
    }
  } catch (e) {
    throw new Error(JSON.stringify({ message: errorMsg }))
  }

  try {
    let deserializedList
    if (CONNECTION_DESTINATION.toString() === SERVICE.Console) {
      deserializedList = await deserialize(response[0].inference_result.Inferences[0].O, aiTask)
    } else {
      deserializedList = await deserialize(response[0].Inferences[0].O, aiTask)
    }
    const deserializedRawData = response[0]
    if (deserializedList !== undefined) {
      if (aiTask === OBJECT_DETECTION || aiTask === CLASSIFICATION) {
        if (CONNECTION_DESTINATION.toString() === SERVICE.Console) {
          deserializedRawData.inference_result.Inferences[0].O = deserializedList
        } else {
          deserializedRawData.Inferences[0].O = deserializedList
        }
      } else if (aiTask === SEGMENTATION) {
        if (CONNECTION_DESTINATION.toString() === SERVICE.Console) {
          const T = deserializedRawData.inference_result.Inferences[0].T
          deserializedRawData.inference_result.Inferences[0] = { T, ...deserializedList }
        } else {
          const T = deserializedRawData.Inferences[0].T
          deserializedRawData.Inferences[0] = { T, ...deserializedList }
        }
      }
      const copyRawData = JSON.parse(JSON.stringify(deserializedRawData))
      const inferences = {
        deserializedRawData,
        inferencesList: {
          inference_result: {
            Inferences: []
          }
        }
      }
      if (CONNECTION_DESTINATION.toString() === SERVICE.Console) {
        inferences.inferencesList = deserializedRawData
      } else {
        const Inferences = copyRawData.Inferences
        inferences.inferencesList.inference_result.Inferences = Inferences
      }
      return inferences
    }
  } catch (e) {
    throw new Error(JSON.stringify({ message: 'The specified AITask and data AITask may not match.\rPlease check the specified AITask.' }))
  }
}

/**
 * Retrieves inference result items from Cosmos DB as defined by the query parameter.
 *
 * @param req Request
 * deviceId: edge AI device ID
 * timestamp: used filter on data related to the image
 * subDirectory: inference data's subdirectory name.
 * aiTask: Specify the AI model used  ex.'objectDetection'
 * mode: use 'realtimeMode' or 'historyMode'
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
  const deviceId: string | undefined = req.query.deviceId?.toString()
  const subDirectory: string | undefined = req.query.subDirectory?.toString()
  const timestamp: string | undefined = req.query.timestamp?.toString()
  const aiTask: string | undefined = req.query.aiTask?.toString()
  const mode: string | undefined = req.query.mode?.toString()

  if (deviceId === undefined || subDirectory === undefined ||
    timestamp === undefined || aiTask === undefined ||
    mode === undefined) {
    throw new Error(JSON.stringify({ message: 'Some parameter is undefined.' }))
  } else {
    if (aiTask !== OBJECT_DETECTION && aiTask !== CLASSIFICATION && aiTask !== SEGMENTATION) {
      res.status(400).json('Only objectDetection or classification or segmentation.')
      return
    }
    await getInferenceResults(deviceId, subDirectory, timestamp, aiTask, mode)
      .then((result) => {
        const response = {
          deserializedRawData: result?.deserializedRawData,
          inferencesList: result?.inferencesList
        }
        return res.status(200).json(response)
      }).catch(err => {
        return res.status(500).json(err.message)
      })
  }
}
