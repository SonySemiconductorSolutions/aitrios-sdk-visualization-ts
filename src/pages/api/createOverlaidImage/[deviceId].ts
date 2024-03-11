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
import * as fs from 'fs'
import * as path from 'path'
import { WORK_DIR, getTimestampFromImageFIleName } from '../../../hooks/fileUtil'
import Sharp from 'sharp'
import * as util from '../../../hooks/util'
import { OBJECT_DETECTION, CLASSIFICATION, SEGMENTATION } from '../../../pages/index'
import { CONNECTION_DESTINATION, SERVICE } from '../../../common/settings'

/**
 * Get timestamp from Directory name.
 *
 * @param dir directory path.
 *
 * @returns Timestamp list.
 */

const WIDTH_MARGIN = 20
const HEIGHT_MARGIN = 20
const TIMESTAMP_WIDTH = 200
const TIMESTAMP_HEIGHT = 16
const LABEL_OFFSET = 14
const DEFAULT_FONT_SIZE = 12
const FONT_SIZE = 9 // 150 * 150 Appropriate Size

const convertColorToRGB = (color: number) => {
  const r = (color & 0xff000000) >>> 24
  const g = (color & 0x00ff0000) >>> 16
  const b = (color & 0x0000ff00) >>> 8
  const a = (color & 0x000000ff)
  return { r, g, b, a }
}

const drawRectAngle = (canvasBuffer: { data: any; info: any }, { x, y, width, height }: { x: any; y: any; width: any; height: any }, color: string) => {
  const colorType = util.convertNameToType(color)
  if (colorType !== undefined) {
    const { r, b, g, a } = convertColorToRGB(colorType)
    for (let i = y + 1; i < y + height; i++) {
      const lettOffset = x * 4 + i * canvasBuffer.info.width * 4
      canvasBuffer.data[lettOffset + 0] = r
      canvasBuffer.data[lettOffset + 1] = g
      canvasBuffer.data[lettOffset + 2] = b
      canvasBuffer.data[lettOffset + 3] = a
      const rightOffset = (x + width) * 4 + i * canvasBuffer.info.width * 4
      canvasBuffer.data[rightOffset + 0] = r
      canvasBuffer.data[rightOffset + 1] = g
      canvasBuffer.data[rightOffset + 2] = b
      canvasBuffer.data[rightOffset + 3] = a
    }
    for (let i = x; i <= x + width; i++) {
      const topOffset = i * 4 + y * canvasBuffer.info.width * 4
      canvasBuffer.data[topOffset + 0] = r
      canvasBuffer.data[topOffset + 1] = g
      canvasBuffer.data[topOffset + 2] = b
      canvasBuffer.data[topOffset + 3] = a
      const bottomOffset = i * 4 + (y + height) * canvasBuffer.info.width * 4
      canvasBuffer.data[bottomOffset + 0] = r
      canvasBuffer.data[bottomOffset + 1] = g
      canvasBuffer.data[bottomOffset + 2] = b
      canvasBuffer.data[bottomOffset + 3] = a
    }
  }
}

const overlayTag = async (canvasBuffer: { data: any; info: any }, tag: Sharp.Sharp, { x, y }: { x: any; y: number }) => {
  const tagBuffer = await tag.raw().toBuffer({ resolveWithObject: true })
  const width = tagBuffer.info.width
  const height = tagBuffer.info.height
  for (let i = y, ii = 0; i < y + height; i++, ii++) {
    for (let j = x, jj = 0; j < x + width; j++, jj++) {
      const dstOffset = j * 4 + i * canvasBuffer.info.width * 4
      const srcOffset = jj * 4 + ii * tagBuffer.info.width * 4
      canvasBuffer.data[dstOffset + 0] = tagBuffer.data[srcOffset + 0]
      canvasBuffer.data[dstOffset + 1] = tagBuffer.data[srcOffset + 1]
      canvasBuffer.data[dstOffset + 2] = tagBuffer.data[srcOffset + 2]
      canvasBuffer.data[dstOffset + 3] = tagBuffer.data[srcOffset + 3]
    }
  }
}

const createCanvas = async (file: string, { x, y }: any) => {
  const srcImage = Sharp(file)
  const metadata = await srcImage.metadata()

  if (metadata.width && metadata.height !== undefined) {
    const width = metadata.width + x * 2
    const height = metadata.height + y * 2
    const channels = 4

    const canvasMem = Buffer.alloc(width * height * channels, util.WHITE)
    const canvas = Sharp(canvasMem, { raw: { width, height, channels } })
      .composite([{ input: file, left: x, top: y }])
    return canvas
  }
}

const getSvgText = (text: string, { x, y }: any, color: string, fontSize: number) => {
  const replaceText = text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  const svgText = `
        <svg width="${x}" height="${y}">
            <style>
            .title {fill: ${color}; font-size: ${fontSize}px}
            </style>
            <text font-family="Meiryo" x="0%" y="80%" text-anchor="left" class="title">${replaceText}</text>
        </svg>`
  return Buffer.from(svgText)
}

const getTextWidth = (xLimit: number, text: string) => {
  let width = 0
  // Half-width alphanumeric character width table at 12 pixels (ASCII code order)
  const asciiWidthTable = [4, 5, 6, 10, 8, 11, 9, 3, 5, 5, 6, 10, 4, 4, 4, 4, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 4, 4, 10, 10, 10, 6, 12, 8, 8, 8, 9, 8, 7, 9, 9, 4, 4, 8, 7, 10, 9, 9, 7, 9, 8, 8, 7, 9, 8, 12, 8, 7, 8, 5, 4, 5, 10, 6, 6, 7, 8, 7, 8, 7, 4, 8, 8, 3, 3, 7, 3, 12, 8, 7, 8, 8, 5, 6, 5, 8, 7, 10, 7, 7, 6, 8, 4, 8, 10]
  let minCount = 0
  for (let i = 0; i < text.length; i++) {
    if (text[i].match(/^[\x20-\x7e]*$/)) {
      const asciiWidth = asciiWidthTable[(text.charCodeAt(i) - 0x20)]
      if (asciiWidth <= 4) {
        minCount += 1
      }
      width += asciiWidth
    } else if (text[i].match(/^[ｦ-ﾟ]*$/)) {
      width += Math.round(FONT_SIZE / 2)
    } else {
      width += FONT_SIZE
    }
  }
  if (minCount >= 10) {
    width += (Math.round(minCount / 10) * 3)
  }

  width = Math.round(width * (FONT_SIZE / DEFAULT_FONT_SIZE))

  return width > xLimit ? xLimit : width
}

const createTag = async ({ x, y, xLimit }: any, color: any, text: string, textColor: any) => {
  const colorType = util.convertNameToType(color)

  if (colorType !== undefined) {
    const { r, b, g, a } = convertColorToRGB(colorType)
    const channels = 4
    x = getTextWidth(xLimit, text)
    const tagText = getSvgText(text, { x, y }, textColor, FONT_SIZE)
    const canvasMem = Buffer.alloc(x * y * channels, color)
    const canvas = Sharp(canvasMem, { raw: { width: x, height: y, channels } })
      .composite([{ input: { create: { width: x, height: y, channels, background: { r, g, b, alpha: a } } } }, { input: tagText, left: 0, top: 0 }])
    return canvas
  }
}

const overlaidImageOD = async (inferenceDataPath: string, rawImagePath: string, labelData: string[], isDisplayTS: boolean, probability: number) => {
  try {
    const timestamp = path.basename(inferenceDataPath, '.json')
    const loadJson = fs.readFileSync(inferenceDataPath)
    const parsedJson = JSON.parse(loadJson.toString())
    let srcInference
    if (CONNECTION_DESTINATION.toString() === SERVICE.Console) {
      srcInference = util.convertInferencesOD(parsedJson.inference_result.Inferences[0].O[0])
    } else {
      srcInference = util.convertInferencesOD(parsedJson.Inferences[0].O[0])
    }

    // load image and create margin area
    const canvas = await createCanvas(rawImagePath, { x: WIDTH_MARGIN * 2, y: HEIGHT_MARGIN * 2 })
    if (canvas !== undefined) {
      const canvasMetadata = await canvas.metadata()
      let canvasWidth = 0
      // draw margin area
      const canvasBuffer = await canvas.raw().toBuffer({ resolveWithObject: true })
      if (canvasMetadata.width && canvasMetadata.height !== undefined) {
        canvasWidth = canvasMetadata.width
        drawRectAngle(canvasBuffer, { x: WIDTH_MARGIN, y: HEIGHT_MARGIN, width: canvasMetadata.width - WIDTH_MARGIN * 2 - 1, height: canvasMetadata.height - HEIGHT_MARGIN * 2 - 1 }, 'black')
      }

      // draw inference
      for (const inference of srcInference) {
        if (Math.round(inference.confidence * 100) >= probability) {
          const tagX = inference.x + WIDTH_MARGIN * 2
          drawRectAngle(canvasBuffer, { x: tagX, y: inference.y + HEIGHT_MARGIN * 2, width: inference.width, height: inference.height }, inference.bbStrokeColor)
          const labelText = `${labelData[Number(inference.label)]} ${Math.round(inference.confidence * 100)}%`
          const tag = await createTag({ x: inference.width, y: LABEL_OFFSET, xLimit: canvasWidth - tagX }, inference.tagStrokeColor, labelText, inference.tagTextColor)
          if (tag !== undefined) {
            await overlayTag(canvasBuffer, tag, { x: tagX, y: inference.y + HEIGHT_MARGIN * 2 - LABEL_OFFSET })
          }
        }
      }

      // create timestamp tag
      const tag = await createTag({ x: TIMESTAMP_WIDTH, y: TIMESTAMP_HEIGHT, xLimit: canvasWidth - WIDTH_MARGIN }, 'yellow', `Timestamp : ${timestamp}`, util.CHOCOLATE)
      if (tag !== undefined) {
        const tagMetadata = await tag.metadata()
        const tagBuffer = await tag.raw().toBuffer({ resolveWithObject: true })

        if (tagMetadata.width && tagMetadata.height && tagMetadata.channels !== undefined) {
          await Sharp(new Uint8ClampedArray(canvasBuffer.data.buffer), { raw: { width: canvasBuffer.info.width, height: canvasBuffer.info.height, channels: canvasBuffer.info.channels } })
            .composite([{ input: Buffer.from(new Uint8ClampedArray(tagBuffer.data.buffer)), blend: isDisplayTS ? 'over' : 'dest', left: WIDTH_MARGIN, top: 0, raw: { width: tagMetadata.width, height: tagMetadata.height, channels: tagMetadata.channels } }])
            .toFile(rawImagePath)
          console.log(`Overlaid Image save in ${rawImagePath}`)
        }
      }
    }
  } catch (e) {
    throw new Error(JSON.stringify({ message: 'Fail to save overlaid Image.' }))
  }
}

export const overlaidImageCL = async (inferenceDataPath: string, rawImagePath: string, labelData: string[], isDisplayTS: boolean, probability: number, isOverlayIR: boolean, overlayIRC: string) => {
  try {
    const timestamp = path.basename(inferenceDataPath, '.json')
    const loadJson = fs.readFileSync(inferenceDataPath)
    const parsedJson = JSON.parse(loadJson.toString())
    let srcInference
    if (CONNECTION_DESTINATION.toString() === SERVICE.Console) {
      srcInference = util.convertInferencesCls(parsedJson.inference_result.Inferences[0].O[0])
    } else {
      srcInference = util.convertInferencesCls(parsedJson.Inferences[0].O[0])
    }
    // load image and create margin area
    const canvas = await createCanvas(rawImagePath, { x: WIDTH_MARGIN * 2, y: HEIGHT_MARGIN * 2 })
    if (canvas !== undefined) {
      const canvasMetadata = await canvas.metadata()
      let canvasWidth = 0

      // draw margin area
      const canvasBuffer = await canvas.raw().toBuffer({ resolveWithObject: true })
      if (canvasMetadata.width !== undefined && canvasMetadata.height !== undefined) {
        canvasWidth = canvasMetadata.width
        drawRectAngle(canvasBuffer, { x: WIDTH_MARGIN, y: HEIGHT_MARGIN, width: canvasMetadata.width - WIDTH_MARGIN * 2 - 1, height: canvasMetadata.height - HEIGHT_MARGIN * 2 - 1 }, 'black')
      }

      // create timestamp tag
      const tag = await createTag({ x: TIMESTAMP_WIDTH, y: TIMESTAMP_HEIGHT, xLimit: canvasWidth - WIDTH_MARGIN }, 'yellow', `Timestamp : ${timestamp}`, util.CHOCOLATE)
      if (tag !== undefined) {
        const tagMetadata = await tag.metadata()
        const tagBuffer = await tag.raw().toBuffer({ resolveWithObject: true })

        // draw undefined and save
        const text = util.lavelTextCls(labelData, srcInference, probability)
        const svg = getSvgText(text, { x: 160, y: 32 }, overlayIRC, 28)
        if (tagMetadata.width && tagMetadata.height && tagMetadata.channels !== undefined) {
          await Sharp(new Uint8ClampedArray(canvasBuffer.data.buffer), { raw: { width: canvasBuffer.info.width, height: canvasBuffer.info.height, channels: canvasBuffer.info.channels } })
            .composite([{ input: Buffer.from(new Uint8ClampedArray(tagBuffer.data.buffer)), blend: isDisplayTS ? 'over' : 'dest', left: WIDTH_MARGIN, top: 0, raw: { width: tagMetadata.width, height: tagMetadata.height, channels: tagMetadata.channels } },
              { input: svg, blend: isOverlayIR ? 'over' : 'dest', left: WIDTH_MARGIN * 2, top: Math.round(canvasBuffer.info.height * 4 / 10) }])
            .toFile(rawImagePath)
          console.log(`Overlaid Image save in ${rawImagePath}`)
        }
      }
    }
  } catch (e) {
    throw new Error(JSON.stringify({ message: 'Fail to save overlaid Image.' }))
  }
}

const overlaidImageSEG = async (inferenceDataPath: string, rawImagePath: string, isDisplayTS: boolean, transparency: number, labelListData: util.SegmentationLabelType[]) => {
  try {
    const timestamp = path.basename(inferenceDataPath, '.json')
    const loadJson = fs.readFileSync(inferenceDataPath)
    const parsedJson = JSON.parse(loadJson.toString())
    let inferenceSEG: util.SegInferenceProps
    if (CONNECTION_DESTINATION.toString() === SERVICE.Console) {
      inferenceSEG = parsedJson.inference_result.Inferences[0]
    } else {
      inferenceSEG = parsedJson.Inferences[0]
    }

    // load image and create margin area
    const canvas = await createCanvas(rawImagePath, { x: WIDTH_MARGIN * 2, y: HEIGHT_MARGIN * 2 })
    if (canvas !== undefined) {
      const canvasMetadata = await canvas.metadata()

      // draw margin area
      const canvasBuffer = await canvas.raw().toBuffer({ resolveWithObject: true })
      if (canvasMetadata.width !== undefined && canvasMetadata.height !== undefined) {
        drawRectAngle(canvasBuffer, { x: WIDTH_MARGIN, y: HEIGHT_MARGIN, width: canvasMetadata.width - WIDTH_MARGIN * 2 - 1, height: canvasMetadata.height - HEIGHT_MARGIN * 2 - 1 }, 'black')
      }

      // create timestamp tag
      const tag = await createTag({ x: TIMESTAMP_WIDTH, y: TIMESTAMP_HEIGHT, xLimit: canvasBuffer.info.width }, 'yellow', `Timestamp : ${timestamp}`, util.CHOCOLATE)
      if (tag !== undefined) {
        const tagMetadata = await tag.metadata()
        const tagBuffer = await tag.raw().toBuffer({ resolveWithObject: true })

        // draw segmentation and save
        const metadata = await Sharp(rawImagePath).metadata()
        const channel = 4
        const hexTransparency = '0x' + Math.round(255 - transparency * (255 / 100)).toString(16)
        const segmentColor: number[][] = []
        for (let i = 0; i < labelListData.length; i += 1) {
          const decColor = util.hexColorToDecArray(labelListData[i])
          segmentColor.push(decColor)
        }

        if (metadata.width !== undefined && metadata.height !== undefined) {
          const length = metadata.width * metadata.height * channel
          const canvasMem = Buffer.alloc(length, 0)
          for (let i = 0; i < length; i += channel) {
            if (inferenceSEG.numClassId === 0 || inferenceSEG.numClassId === undefined) {
              if (segmentColor[inferenceSEG.classIdMap[i / 4]] === undefined) {
                continue
              }
              canvasMem[i + 0] = segmentColor[inferenceSEG.classIdMap[i / 4]][0]
              canvasMem[i + 1] = segmentColor[inferenceSEG.classIdMap[i / 4]][1]
              canvasMem[i + 2] = segmentColor[inferenceSEG.classIdMap[i / 4]][2]
              if (segmentColor[inferenceSEG.classIdMap[i / 4]][3] === 255) {
                canvasMem[i + 3] = Number(hexTransparency)
              } else {
                canvasMem[i + 3] = 0x00
              }
            } else {
              const maxClassId = util.convertInferencesSEG(inferenceSEG, i / 4)
              if (segmentColor[maxClassId] === undefined) {
                continue
              }
              canvasMem[i] = segmentColor[maxClassId][0]
              canvasMem[i + 1] = segmentColor[maxClassId][1]
              canvasMem[i + 2] = segmentColor[maxClassId][2]
              if (segmentColor[maxClassId][3] === 255) {
                canvasMem[i + 3] = Number(hexTransparency)
              } else {
                canvasMem[i + 3] = 0x00
              }
            }
          }
          if (tagMetadata.width && tagMetadata.height && tagMetadata.channels !== undefined) {
            await Sharp(new Uint8ClampedArray(canvasBuffer.data.buffer), { raw: { width: canvasBuffer.info.width, height: canvasBuffer.info.height, channels: canvasBuffer.info.channels } })
              .composite([{ input: Buffer.from(new Uint8ClampedArray(tagBuffer.data.buffer)), blend: isDisplayTS ? 'over' : 'dest', left: WIDTH_MARGIN, top: 0, raw: { width: tagMetadata.width, height: tagMetadata.height, channels: tagMetadata.channels } },
                { input: canvasMem, left: WIDTH_MARGIN * 2, top: HEIGHT_MARGIN * 2, raw: { width: metadata.width, height: metadata.height, channels: channel } }])
              .toFile(rawImagePath)
            console.log(`Overlaid Image save in ${rawImagePath}`)
          }
        }
      }
    }
  } catch (e) {
    throw new Error(JSON.stringify({ message: 'Fail to save overlaid Image.' }))
  }
}

/**
 * Uses Console to get image data and save it.
 *
 * @param deviceId The id of the device to get uploading image data.
 * @param subDirectory image data's subdirectory name.
 * @param aiTask The model of the used AI model type.
 * @param labelData Display labels for inference results set.
 * @param isDisplayTs Whether to display timestamps or not.
 * @param probability Boundary value of the confidence level to be displayed.
 * @param isOverlayIR Whether to display the highest Score of inference results or not.
 * @param overlayIRC Display color of information with the highest Score of inference results.
 * @param transparency Boundary value of the transparency to be displayed.
 * @param labelListData List of display labels for inference results set (Segmentation).
 */
async function createOverlaidImage (deviceId: string, subDirectory: string, aiTask: string, labelData: string[], isDisplayTs: boolean, probability: number, isOverlayIR: boolean, overlayIRC: string, transparency: number, labelListData: util.SegmentationLabelType[]) {
  let savedDirPath
  let timestampList
  try {
    savedDirPath = path.join(WORK_DIR, deviceId, subDirectory)
    timestampList = getTimestampFromImageFIleName(savedDirPath)
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Fail to get timestamp list.' }))
  }

  try {
    if (timestampList && savedDirPath !== undefined) {
      for (const timeStamp of timestampList) {
        const individualDataDir = path.join(savedDirPath, timeStamp)
        const inferenceDataPath = individualDataDir + '.json'
        const rawImagePath = individualDataDir + '.jpg'
        if (fs.existsSync(inferenceDataPath)) {
          if (aiTask === OBJECT_DETECTION) {
            await overlaidImageOD(inferenceDataPath, rawImagePath, labelData, isDisplayTs, probability)
          } else if (aiTask === CLASSIFICATION) {
            await overlaidImageCL(inferenceDataPath, rawImagePath, labelData, isDisplayTs, probability, isOverlayIR, overlayIRC)
          } else if (aiTask === SEGMENTATION) {
            await overlaidImageSEG(inferenceDataPath, rawImagePath, isDisplayTs, transparency, labelListData)
          }
        }
      }
    }
  } catch (err) {
    throw new Error(JSON.stringify({ message: 'Fail to save overlaid Image.' }))
  }
}

/**
 * Create overlaid Image as defined by the query parameter and request body.
 *
 * @param req Request
 * deviceId: edge AI device ID
 * subDirectory: image data's subdirectory name
 * aiTask: Specify the AI model used  ex.'objectDetection'
 * labelData: Display labels for inference results set
 * isDisplayTs: Whether to display timestamps or not
 * probability: Boundary value of the confidence level to be displayed
 * isOverlayIR: Whether to display the highest Score of inference results or not
 * overlayIRC: Display color of information with the highest Score of inference results
 * transparency: Boundary value of the transparency to be displayed
 * labelListData: List of display labels for inference results set (Segmentation)
 *
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests.' })
    return
  }
  const body = req.body
  const deviceId: string | undefined = req.query.deviceId?.toString()
  const subDirectory: string = body.subDirectory
  const aiTask: string = body.aiTask
  const labelData: string[] = body.labelData
  const isDisplayTs: boolean = body.isDisplayTs
  const probability: number = Number(body.probability)
  const isOverlayIR: boolean = body.isOverlayIR
  const overlayIRC: string = body.isOverlayIRC
  const transparency: number = body.transparency
  const labelListData: util.SegmentationLabelType[] = body.labelListData

  if (deviceId === undefined) {
    throw new Error(JSON.stringify({ message: 'Device ID is undefined.' }))
  } else {
    await createOverlaidImage(deviceId, subDirectory, aiTask, labelData, isDisplayTs, probability, isOverlayIR, overlayIRC, transparency, labelListData)
      .then(() => {
        res.status(200).end()
      }).catch(err => {
        res.status(500).json(err.message)
      })
  }
}
