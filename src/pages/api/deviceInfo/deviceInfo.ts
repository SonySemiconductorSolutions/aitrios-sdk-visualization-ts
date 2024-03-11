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
import { DeviceListData } from '../../../hooks/util'
import { getConsoleService } from '../../../hooks/getConsoleStorage'

/**
 * Uses Console to retrieve information about a devices.
 *
 * @returns List about the devices ID.
 */
const getDeviceInfo = async () => {
  const calClient = await getConsoleService()
  const response = await calClient.deviceManagement.getDevices()
  if (typeof response.result !== 'undefined' && response.result === 'ERROR') {
    throw new Error(JSON.stringify({ message: response.message }))
  }
  if (typeof response.data.result !== 'undefined' && response.data.result === 'WARNING') {
    throw new Error(JSON.stringify({ message: response.data.message }))
  }
  return response.data
}

/**
 * Get devices ID List from Console.
 *
 * @param req Request
 * @param res Response
 *
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests.' })
    return
  }

  await getDeviceInfo()
    .then(result => {
      const deviceData: DeviceListData = {}
      result.devices.forEach((elm: any) => {
        deviceData[elm.property.device_name] = elm.device_id
      })
      const sortedKeys = Object.keys(deviceData).sort((a, b) => {
        a = a.toLowerCase()
        b = b.toLowerCase()
        return a < b ? -1 : a > b ? 1 : 0
      })
      const sortDeviceData: DeviceListData = {}
      sortedKeys.forEach((key) => {
        sortDeviceData[key] = deviceData[key]
      })
      res.status(200).json(sortDeviceData)
    }).catch(err => {
      res.status(500).json(err.message)
    })
}
