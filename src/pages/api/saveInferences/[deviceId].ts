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
import { CLASSIFICATION, OBJECT_DETECTION, SEGMENTATION } from '../..'
import { deserialize } from '../../../hooks/deserialize/deserializeFunction'
import { saveInference, WORK_DIR, getTimestampFromImageFIleName } from '../../../hooks/fileUtil'
import { getDateDecrement, getDateIncrement } from '../../../hooks/util'
import * as path from 'path'
import { getInference } from '../../../hooks/getStorageData'
import { CONNECTION_DESTINATION, SERVICE } from '../../../common/settings'

/**
 * Get timestamp from Directory name.
 *
 * @param dir directory path.
 *
 * @returns Timestamp list.
 */

/**
 * Uses Console to get inference data and save it.
 *
 * @param deviceId The id of the device to get uploading image data.
 * @param subDirectory the image data's subdirectory name.
 * @param aiTask The model of the used AI model type.

 * @returns an object containing information on whether or not the operation succeeded. Ex: { "result": "SUCCESS" }
 */
async function getSaveInference (deviceId: string, subDirectory: string, aiTask: string) {
  const errorMsg = 'Fail to save Inferences.'
  let saveDirPath
  let timestampList
  try {
    saveDirPath = path.join(WORK_DIR, deviceId, subDirectory)
    timestampList = getTimestampFromImageFIleName(saveDirPath)
    timestampList.sort()
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Fail to get timestamp list.' }))
  }

  const maxNumberOfGetInference = 10000
  const procCount = Math.ceil(timestampList.length / (maxNumberOfGetInference / 2))
  for (let i = 0; i < procCount; i++) {
    const execList = timestampList.slice(i * (maxNumberOfGetInference / 2), (i + 1) * (maxNumberOfGetInference / 2))
    const response = await getInference(deviceId, subDirectory, getDateDecrement(execList[0]), getDateIncrement(timestampList[execList.length - 1]), maxNumberOfGetInference)
    if (!response) {
      throw new Error(JSON.stringify({ message: errorMsg }))
    }

    if (response.length === 0) {
      continue
    }

    for (const timeStamp of execList) {
      for (const data of response) {
        if (CONNECTION_DESTINATION.toString() === SERVICE.Console) {
          if (timeStamp === data.inference_result.Inferences[0].T) {
            try {
              let deserializedList
              if (data.inference_result.Inferences[0].O) {
                deserializedList = await deserialize(data.inference_result.Inferences[0].O, aiTask)
              }
              if (deserializedList !== undefined) {
                if (aiTask === OBJECT_DETECTION || aiTask === CLASSIFICATION) {
                  data.inference_result.Inferences[0].O = deserializedList
                } else if (aiTask === SEGMENTATION) {
                  const T = data.inference_result.Inferences[0].T
                  data.inference_result.Inferences[0] = { T, ...deserializedList }
                }
              }
            } catch (err) {
              throw new Error(JSON.stringify({ message: 'The specified AITask and data AITask may not match.\rPlease check the specified AITask.' }))
            }
            try {
              saveInference(data, saveDirPath, timeStamp)
            } catch (err) {
              throw new Error(JSON.stringify({ message: errorMsg }))
            }
          }
        } else {
          if (timeStamp === data.Inferences[0].T) {
            try {
              let deserializedList
              if (data.Inferences[0].O) {
                deserializedList = await deserialize(data.Inferences[0].O, aiTask)
              }
              if (deserializedList !== undefined) {
                if (aiTask === OBJECT_DETECTION || aiTask === CLASSIFICATION) {
                  data.Inferences[0].O = deserializedList
                } else if (aiTask === SEGMENTATION) {
                  const T = data.Inferences[0].T
                  data.Inferences[0] = { T, ...deserializedList }
                }
              }
            } catch (err) {
              throw new Error(JSON.stringify({ message: 'The specified AITask and data AITask may not match.\rPlease check the specified AITask.' }))
            }
            try {
              saveInference(data, saveDirPath, timeStamp)
            } catch (err) {
              throw new Error(JSON.stringify({ message: errorMsg }))
            }
          }
        }
      }
    }
  }
}

/**
 * Get inference data as defined by the query parameter.
 *
 * @param req Request
 * deviceId: edge AI device ID
 * subDirectory: image data's subdirectory name.
 * aiTask: The model of the used AI model type.
 *
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests.' })
    return
  }
  const deviceId: string | undefined = req.query.deviceId?.toString()
  const subDirectory: string | undefined = req.body.subDirectory?.toString()
  const aiTask: string | undefined = req.body.aiTask?.toString()

  if (deviceId === undefined || subDirectory === undefined || aiTask === undefined) {
    throw new Error(JSON.stringify({ message: 'Some parameter is undefined.' }))
  } else {
    if (aiTask !== OBJECT_DETECTION && aiTask !== CLASSIFICATION && aiTask !== SEGMENTATION) {
      res.status(400).json({ message: 'Only objectDetection or classification or segmentation.' })
      return
    }
    await getSaveInference(deviceId, subDirectory, aiTask)
      .then(result => {
        res.status(200).json(result)
      }).catch(err => {
        res.status(500).json(err.message)
      })
  }
}
