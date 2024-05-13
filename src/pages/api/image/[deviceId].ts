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
import { CONNECTION_DESTINATION, SERVICE } from '../../../common/settings'
import { HISTORY_MODE, REALTIME_MODE } from '../../../common/constants'
import { checkExt } from '../../../hooks/fileUtil'
import { utcToZonedTime } from 'date-fns-tz'
import { format } from 'date-fns'
import { convertDate } from '../../../hooks/util'

/**
 * Uses Console to get uploading image data
 *
 * @param deviceId The id of the Edge Device to get uploading image data.
 * @param imagePath The path of the storage for acquired images.
 * @param numberOfImages The number of the image data.
 * @param skip The number of the index to start getting.
 * @param orderBy The order of datas, ascending or descending .
 * @param mode The type of mode selected.
 *
 * @returns an object . Ex: { "data": {"images": ["contents": ..., "name":...,]} } or { "result": "ERROR", "code": ..., "message": ..., "time": ... }
 */
const getBlob = async (deviceId: string, imagePath: string, numberOfImages: number, skip: number, orderBy: string, mode: string) => {
  if (CONNECTION_DESTINATION.toString() === SERVICE.Local && mode === REALTIME_MODE) {
    deviceId = ''
    imagePath = ''
  }
  const errorMsg = 'Cannot get JPG image.'
  let fromDatetime
  let toDatetime
  try {
    const utcDate = utcToZonedTime(new Date(), 'UTC')
    if (CONNECTION_DESTINATION.toString() === SERVICE.Console && mode === REALTIME_MODE) {
      const notConvertedDate = new Date(utcDate.getTime() - 1 * 60 * 60 * 1000)
      fromDatetime = format(notConvertedDate, 'yyyyMMddHHmm')
    } else if (CONNECTION_DESTINATION.toString() === SERVICE.Console && mode === HISTORY_MODE) {
      const convertedFromDate = convertDate(imagePath)
      fromDatetime = format(convertedFromDate.getTime(), 'yyyyMMddHHmm')
      const convertedToDate = new Date(convertedFromDate.getTime() + 10 * 60 * 60 * 1000)
      const additionalToDatetime = format(convertedToDate, 'yyyyMMddHHmm')
      const currentToDatetime = format(utcDate.getTime(), 'yyyyMMddHHmm')
      toDatetime = additionalToDatetime < currentToDatetime ? additionalToDatetime : currentToDatetime
    }
  } catch (e) {
    console.log(e)
    throw new Error(JSON.stringify({ message: errorMsg }))
  }
  const response = await getImage(deviceId, imagePath, orderBy, skip, numberOfImages, fromDatetime, toDatetime)
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
    buff: latestImage.contents,
    timestamp: latestImage.name.replace('.jpg', '')
  }
  return result
}

/**
 * Get image data as defined by the query parameter.
 *
 * @param req Request
 * deviceId: Edge Device ID
 * imagePath: image data's subdirectory name.
 * numberOfImages: get Image numbers. only use '1'
 * skip: Number of images to skip get.
 * orderBy: use 'ASC' or 'DESC'
 * mode: use 'realtimeMode' or 'historyMode'
 *
 * @param res Response
 * buff: Get image contents data (base64 encode)
 * timestamp: image timestamp
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests.' })
    return
  }
  const deviceId: string | undefined = req.query.deviceId?.toString()
  const imagePath: string | undefined = req.query.imagePath?.toString()
  const numberOfImages: number | undefined = Number(req.query.numberOfImages)
  const skip: number | undefined = Number(req.query.skip)
  const orderBy: string | undefined = req.query.orderBy?.toString()
  const mode: string | undefined = req.query.mode?.toString()

  if (deviceId === undefined || imagePath === undefined || orderBy === undefined || mode === undefined) {
    throw new Error(JSON.stringify({ message: 'Some parameter is undefined.' }))
  } else {
    await getBlob(deviceId, imagePath, numberOfImages, skip, orderBy, mode)
      .then(result => {
        res.status(200).json(result)
      }).catch(err => {
        res.status(500).json(err.message)
      })
  }
}
