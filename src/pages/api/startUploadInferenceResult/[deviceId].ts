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
import { CONNECTION_DESTINATION, SERVICE } from '../../../common/settings'
import { format } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { getConsoleService } from '../../../hooks/getConsoleStorage'
/**
 * Uses Console to request that a get Mode and UploadMethodIR in command parameter files
 *
 * @param deviceId The id of the device to request that it get command parameter files.
 * @returns an object containing information on whether or not the operation succeeded. Ex: { "Mode": "1", "UploadMethodIR": "Mqtt"}
 */
const getCommandParameterFile = async (deviceId: string) => {
  const calClient = await getConsoleService()
  const response = await calClient.deviceManagement.getCommandParameterFile()
  if (typeof response.result !== 'undefined' && response.result === 'ERROR') {
    throw new Error(JSON.stringify({ message: response.message }))
  }
  if (typeof response.data.result !== 'undefined' && response.data.result === 'WARNING') {
    throw new Error(JSON.stringify({ message: response.data.message }))
  }

  const matchData = response.data.parameter_list.filter(function (value: any) {
    return value.device_ids.indexOf(deviceId) !== -1
  })
  const mode = 'Mode' in matchData[0].parameter.commands[0].parameters ? matchData[0].parameter.commands[0].parameters.Mode : 0
  const uploadMethodIR = 'UploadMethodIR' in matchData[0].parameter.commands[0].parameters ? matchData[0].parameter.commands[0].parameters.UploadMethodIR : 'MQTT'

  if (!((uploadMethodIR === 'MQTT' && CONNECTION_DESTINATION === SERVICE.Console) ||
      (uploadMethodIR === 'BlobStorage' && CONNECTION_DESTINATION === SERVICE.Azure) ||
      (uploadMethodIR === 'HTTPStorage' && CONNECTION_DESTINATION === SERVICE.Local))) {
    throw new Error(JSON.stringify({ message: 'Command parameters and CONNECTION_DESTINATION do not match.' }))
  }

  const result = { mode, uploadMethodIR }
  return result
}

/**
 * Uses Console to request that a device start uploading inference data
 *
 * @param deviceId The id of the device to request that it starts uploading inference data.
 * @returns an object containing information on whether or not the operation succeeded. Ex: { "result": "SUCCESS" }
 */
const startUploadInferenceResult = async (deviceId: string) => {
  const parameter = await getCommandParameterFile(deviceId)

  if (parameter.mode !== 1) {
    throw new Error(JSON.stringify({ message: 'Unexpected parameter in Command Parameter File.' }))
  }

  const calClient = await getConsoleService()

  const res = await calClient.deviceManagement.startUploadInferenceResult(deviceId)
  if (typeof res.result !== 'undefined' && (res.result === 'ERROR')) {
    throw new Error(JSON.stringify({ message: res.message }))
  }
  if (typeof res.data.result !== 'undefined' && res.data.result === 'WARNING') {
    throw new Error(JSON.stringify({ message: res.data.message }))
  }
  const response = res.data
  if (CONNECTION_DESTINATION.toString() === SERVICE.Local && response.result === 'SUCCESS') {
    const currentDate = new Date()
    const utcDate = utcToZonedTime(currentDate, 'UTC')
    const dateFormat = 'yyyyMMddHHmmssSSS'
    const outputSubDirectory = format(utcDate, dateFormat)
    response.outputSubDirectory = `local/deviceId/image/${outputSubDirectory}`
  }
  return response
}

/**
 * Request that a device start uploading inference data.
 *
 * @param req Request
 * deviceId: edge AI device ID
 *
 * @param res Response
 * result: execution result
 * outputSubDirectory: storage path for acquired images
 * outputSubDirectoryIR: input inference result storage path, UploadMethodIR:BlobStorage only
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests.' })
    return
  }
  const deviceId: string | undefined = req.query.deviceId?.toString()

  if (deviceId === undefined) {
    throw new Error(JSON.stringify({ message: 'Device ID is undefined.' }))
  } else {
    await startUploadInferenceResult(deviceId)
      .then(result => {
        res.status(200).json(result)
      }).catch(err => {
        res.status(500).json(err.message)
      })
  }
}
