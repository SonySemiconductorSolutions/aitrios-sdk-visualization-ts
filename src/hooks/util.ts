/*
 * Copyright 2022, 2023, 2024 Sony Semiconductor Solutions Corp. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CLASSIFICATION, HISTORY_MODE, OBJECT_DETECTION, REALTIME_MODE, SEGMENTATION } from '../common/constants'
import { CONNECTION_DESTINATION, SERVICE } from '../common/settings'
import { State, Action } from '../hooks/reducer'

export type BoundingBoxProps = {
  x: number
  y: number
  width: number
  height: number
  label: string
  confidence: number
  bbStrokeColor: string
  tagStrokeColor: string
  tagTextColor: string
}

export type ClsInferenceProps = {
  label: string
  confidence: number
}

export type SegInferenceProps = {
  height: number
  width: number
  classIdMap: number[]
  numClassId?: number
  scoreMap?: number[]
}

export type SegmentationLabelType = {
  isVisible: boolean
  label: string
  color: string
}

export type OdData = {
  timestamp: string
  image: string
  inference: BoundingBoxProps[] | undefined
  inferenceRawData: string | undefined
  labelData: string[]
}

export type ClsData = {
  timestamp: string
  image: string
  inference: ClsInferenceProps[] | undefined
  inferenceRawData: string | undefined
  labelData: string[]
}

export type SegData = {
  timestamp: string
  image: string
  inference: SegInferenceProps | undefined
  inferenceRawData: string | undefined
  labelData: SegmentationLabelType[]
}

export type DisplaySetting = {
  probability: number
  isDisplayTs: boolean
  displayScore: number
  isOverlayIR: boolean
  overlayIRC: string
  transparency: number
}

export type labelProps = {
  index: number
  isVisible: boolean
  updateIsVisible: (index: number, props: labelProps) => void
  data: SegData
  setData: (value: React.SetStateAction<SegData>) => void
  id: number
  label: string
  updateLabel: (value: string, index: number, props: labelProps) => void
  color: string
  updateColor: (value: string, index: number, props: labelProps) => void
}

export type colorPickerProps = {
  color: string
  changeColor: (color: string) => void
}

type UploadHandlerProps = {
  deviceId: string
  setIsLoading: (isLoading: boolean) => void
  setLoadingDialogFlg: (loadingDialogFlg: boolean) => void
  state: State
  dispatch: React.Dispatch<Action>
}

export type PollingHandlerProps = {
  deviceId: string
  aiTask: string
  mode: string
  setIsLoading: (isLoading: boolean) => void
  setLoadingDialogFlg: (display: boolean) => void
  state: State
  dispatch: React.Dispatch<Action>
}

type ImageAndInferenceData = {
  image: any
  timestamp: string
  inferenceRawData: string
  inference: string
  inferenceSeg: SegInferenceProps | string
}

export type PollingData = {
  image: any
  timeStamp: string
  inferenceRawData: string
  inference: string
  inferenceSeg: SegInferenceProps | string
  imageCount: number
}

export type setDataProps = {
  pollingData: PollingData | undefined
  aiTask: string
  odData: OdData
  clsData: ClsData
  segData: SegData
  setOdData: (value: React.SetStateAction<OdData>) => void
  setClsData: (value: React.SetStateAction<ClsData>) => void
  setSegData: (value: React.SetStateAction<SegData>) => void
  setLoadingDialogFlg: (display: boolean) => void
  dispatch: React.Dispatch<Action>,
  isPlaying: boolean
}

export type ClassficationProps = {
  data: ClsData
  setData: (value: React.SetStateAction<ClsData>) => void
  displaySetting: DisplaySetting
  dispatch: React.Dispatch<Action>
}

export type ObjectDetectionProps = {
  data: OdData
  setData: (value: React.SetStateAction<OdData>) => void
  displaySetting: DisplaySetting
  dispatch: React.Dispatch<Action>
}

export type SegmentationProps = {
  data: SegData
  setData: (value: React.SetStateAction<SegData>) => void
  displaySetting: DisplaySetting
  dispatch: React.Dispatch<Action>
}

export type LabelTableProps = {
  headerList: String[]
  data: SegData
  setData: (value: React.SetStateAction<SegData>) => void
  updateIsVisible: (index: number, props: labelProps) => void
  updateLabel: (value: string, index: number, props: labelProps) => void
  updateColor: (value: string, index: number, props: labelProps) => void
}

export type ErrorData = {
  result?: string
  code?: string
  message: string
  time?: string
}

export type createZipProps = {
  subDirName: string
  fs: FileSystemFileHandle | undefined
  setFs: (fs: FileSystemFileHandle) => void
}

export type SaveDialogProps = {
  deviceId: string
  subDirectory: string
  startIndex: number
  endIndex: number
  aiTask: string
  fs: FileSystemFileHandle | undefined
  setFs: (fs: FileSystemFileHandle | undefined) => void
  saveDataCategory: string
  labelDataOD: string[]
  labelDataCLS: string[]
  labelDataSEG: SegmentationLabelType[]
  isDisplayTs: boolean
  probability: number
  isOverlayIR: boolean
  overlayIRC: string
  transparency: number
}

export type DeviceListData = {
  [key: string]: string
}

export type DeviceIds = {
  select: string
  list: DeviceListData
}

export type UpdateDeviceIdListProps = {
  setDeviceIds: (value: React.SetStateAction<DeviceIds>) => void
  setLoadingDialogFlg: (display: boolean) => void
}

export const WHITE = 0xffffffff
export const BLACK = 0x000000ff
export const YELLOW = 0xffff00ff
export const BLUE = 0x0000ffff
export const TOMATO = 0xff6347ff
export const GREEN = 0x008000ff
export const RED = 0xff0000ff
export const PINK = 0xffc0cbff
export const CYAN = 0x00ffffff
export const ORANGE = 0xffa500ff
export const TEAL = 0x008080ff
export const PURPLE = 0x800080ff
export const CHOCOLATE = 0xd2691eff

export const convertNameToType = (color: string) => {
  const table = [
    { type: WHITE, name: 'white' },
    { type: BLACK, name: 'black' },
    { type: YELLOW, name: 'yellow' },
    { type: BLUE, name: 'blue' },
    { type: TOMATO, name: 'tomato' },
    { type: GREEN, name: 'green' },
    { type: RED, name: 'red' },
    { type: PINK, name: 'pink' },
    { type: CYAN, name: 'cyan' },
    { type: ORANGE, name: 'orange' },
    { type: TEAL, name: 'teal' },
    { type: PURPLE, name: 'purple' },
    { type: CHOCOLATE, name: 'chocolate' }
  ]
  let colorName
  const nowColor = table.find(({ name }) => name === color)
  if (nowColor !== undefined) {
    colorName = nowColor.type
  }
  return colorName
}

const COLORS = [
  ['blue', 'white'],
  ['black', 'white'],
  ['yellow', 'black'],
  ['tomato', 'black'],
  ['green', 'white'],
  ['red', 'white'],
  ['pink', 'black'],
  ['cyan', 'black'],
  ['orange', 'black'],
  ['teal', 'white'],
  ['purple', 'white']
]

export const uploadHandler = async (props: UploadHandlerProps) => {
  if (!props.deviceId) {
    alert('Select Edge Device Name')
    return
  }
  props.setIsLoading(true)
  if (!props.state.isUploading) {
    startUpload(props)
  } else {
    props.dispatch({ type: 'stopPlaying' })
    stopUpload(props)
  }
  props.setIsLoading(false)
}

export const exportLabelDataODorCLS = async (labelData: string[]) => {
  try {
    const file = await window.showSaveFilePicker({ suggestedName: 'label.json' })
    const stream = await file.createWritable()
    const exportDataFormat = {
      label: labelData
    }
    const blob = new Blob([JSON.stringify(exportDataFormat, null, 2)], { type: 'application/json' })
    await stream.write(blob)
    await stream.close()
  } catch (e: any) {
    if (e.message !== 'The user aborted a request.') {
      handleResponseErr({ message: 'An error has occurred.' })
    }
  }
}

export const importLabelDataODorCLS = (contents: string, setLabelText: (text: string) => void) => {
  try {
    const data = JSON.parse(contents)
    if (!data.label) {
      return window.alert('Json file with a different data format was selected.')
    }
    const viewTxt = JSON.stringify(data.label).replace(/"|\[|\]/g, '').replace(/,/g, '\n')
    setLabelText(viewTxt)
  } catch (error) {
    window.alert('The json format of the label settings file is invalid')
  }
}

export const handleFileInputChangeODorCLS = (event: React.ChangeEvent<HTMLInputElement>, setLabelText: (text: string) => void) => {
  const file = event.target.files?.[0]
  if (file) {
    if (!checkFileExt(file.name, 'json')) return window.alert('Please Select json File')
    const reader = new FileReader()
    reader.onload = () => {
      event.target.value = ''
      importLabelDataODorCLS(reader.result as string, setLabelText)
    }
    reader.readAsText(file)
  }
}

export const exportLabelDataSegmentation = async (labelData: SegmentationLabelType[]) => {
  try {
    const file = await window.showSaveFilePicker({ suggestedName: 'labelList.json' })
    const stream = await file.createWritable()
    const exportDataFormat = {
      labelList: labelData
    }
    const blob = new Blob([JSON.stringify(exportDataFormat, null, 2)], { type: 'application/json' })
    await stream.write(blob)
    await stream.close()
  } catch (e: any) {
    if (e.message !== 'The user aborted a request.') {
      handleResponseErr({ message: 'An error has occurred.' })
    }
  }
}

export const importLabelDataSegmentation = (contents: string, segData: SegData, setData: (value: React.SetStateAction<SegData>) => void) => {
  try {
    const data = JSON.parse(contents)
    if (data.labelList && data.labelList.length !== 0) {
      data.labelList.forEach((elm: SegmentationLabelType) => {
        if (!hasProperty(elm, 'isVisible') || !hasProperty(elm, 'label') || !hasProperty(elm, 'color')) {
          throw new Error('formatErr')
        }
      })
      const newSegData = { ...segData, labelData: [...data.labelList] }
      setData(newSegData)
    } else {
      throw new Error('formatErr')
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'formatErr') {
      window.alert('Json file with a different data format was selected.')
    } else {
      window.alert('The json format of the label settings file is invalid')
    }
  }
}

export const hasProperty = (obj: any, prop: string) => {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

export const checkFileExt = (fileName: string, acceptExt: string) => {
  const fileExt = fileName.split('.').pop()
  if (fileExt?.toLocaleLowerCase() !== acceptExt) {
    return false
  } else {
    return true
  }
}

export const handleFileInputChangeSegmentation = (event: React.ChangeEvent<HTMLInputElement>, data: SegData, setData: (value: React.SetStateAction<SegData>) => void) => {
  const file = event.target.files?.[0]
  if (file) {
    if (!checkFileExt(file.name, 'json')) return window.alert('Please Select json File')
    const reader = new FileReader()
    reader.onload = () => {
      importLabelDataSegmentation(reader.result as string, data, setData)
      event.target.value = ''
    }
    reader.readAsText(file)
  }
}

export const updateIsVisible = (i: number, props: labelProps) => {
  const updateLabelList = [...props.data.labelData]
  updateLabelList[i].isVisible = !updateLabelList[i].isVisible
  const data = { ...props.data, labelData: updateLabelList }
  props.setData(data)
}

export const updateLabel = (value: string, i: number, props: labelProps) => {
  const updateLabelList = [...props.data.labelData]
  updateLabelList[i].label = value
  const data = { ...props.data, labelData: updateLabelList }
  props.setData(data)
}

export const updateColor = (value: string, i: number, props: labelProps) => {
  const updateLabelList = [...props.data.labelData]
  updateLabelList[i].color = value
  const data = { ...props.data, labelData: updateLabelList }
  props.setData(data)
}

export const lineAddClickEvent = (data: SegData, setData: (value: React.SetStateAction<SegData>) => void, addNumber: number | undefined) => {
  const addObj = {
    isVisible: true,
    label: '',
    color: '#FFFFFF'
  }
  const newList = [...data.labelData]
  if (addNumber === undefined || addNumber === 0) {
    newList.splice(0, 0, addObj)
  } else {
    newList.splice(addNumber, 0, addObj)
  }
  const newData = { ...data, labelData: [...newList] }
  setData(newData)
}

export const delLineClickEvent = (data: SegData, setData: (value: React.SetStateAction<SegData>) => void, delNumber: number | undefined, setDelNumber: (delNumber: number) => void) => {
  const newList = [...data.labelData]
  if (delNumber === undefined || delNumber === 0) {
    newList.splice(0, 1)
  } else {
    newList.splice(delNumber, 1)
  }
  const newData = { ...data, labelData: [...newList] }
  setData(newData)
  setDelNumber(0)
}

export const getImageAndInferenceAccordingImage = async (deviceId: string, imagePath: string, mode: string, aiTask: string, skip: number, signal: AbortSignal): Promise<ImageAndInferenceData> => {
  const imageAndInferenceData: ImageAndInferenceData = {
    image: '',
    timestamp: '',
    inferenceRawData: '',
    inference: '',
    inferenceSeg: ''
  }
  const numberOfImages = 1
  const orderBy = mode === REALTIME_MODE ? 'DESC' : 'ASC'
  const url = `/api/image/${deviceId}?imagePath=${imagePath}&numberOfImages=${numberOfImages}&skip=${skip}&orderBy=${orderBy}&mode=${mode}`
  const image = await fetch(url, { method: 'GET', signal })
  if (image.status === 200) {
    const imageData = await image.json()
    const { timestamp } = imageData
    imageAndInferenceData.image = `data:image/jpg;base64,${imageData.buff}`
    imageAndInferenceData.timestamp = timestamp

    const inference = await fetch(`/api/inference/${deviceId}?subDirectory=${imagePath}&timestamp=${timestamp}&aiTask=${aiTask}&mode=${mode}`, { method: 'GET', signal })
    if (inference.status === 200) {
      const inferenceData = await inference.json()
      imageAndInferenceData.inferenceRawData = inferenceData.deserializedRawData
      if (aiTask === SEGMENTATION) {
        imageAndInferenceData.inferenceSeg = inferenceData.inferencesList.inference_result.Inferences[0]
      } else {
        imageAndInferenceData.inference = inferenceData.inferencesList.inference_result.Inferences[0].O[0]
      }
    } else {
      const errorMessage = await inference.json()
      handleResponseErr(errorMessage)
    }
  } else {
    const errorMessage = await image.json()
    handleResponseErr(errorMessage)
  }
  return imageAndInferenceData
}

export const getImageAndInferenceAccordingInference = async (deviceId: string, imagePath: string, mode: string, aiTask: string, signal: AbortSignal): Promise<ImageAndInferenceData> => {
  const imageAndInferenceData: ImageAndInferenceData = {
    image: '',
    timestamp: '',
    inferenceRawData: '',
    inference: '',
    inferenceSeg: ''
  }
  const inference = await fetch(`/api/latestInference?aiTask=${aiTask}`, { method: 'GET', signal })
  if (inference.status === 200) {
    const inferenceData = await inference.json()
    imageAndInferenceData.timestamp = inferenceData.inference.Inferences[0].T
    imageAndInferenceData.inferenceRawData = inferenceData.deserializedRawData
    if (aiTask === SEGMENTATION) {
      imageAndInferenceData.inferenceSeg = inferenceData.inference.Inferences[0]
    } else {
      imageAndInferenceData.inference = inferenceData.inference.Inferences[0].O[0]
    }
    const image = await fetch(`/api/specifiedImage?timestamp=${imageAndInferenceData.timestamp}`, { method: 'GET', signal })
    if (image.status === 200) {
      const imageData = await image.json()
      imageAndInferenceData.image = `data:image/jpg;base64,${imageData.buff}`
    } else {
      const errorMessage = await image.json()
      handleResponseErr(errorMessage)
    }
  } else {
    const errorMessage = await inference.json()
    handleResponseErr(errorMessage)
  }
  return imageAndInferenceData
}

export const pollingHandler = async (props: PollingHandlerProps, abortContoroller: AbortController): Promise<PollingData> => {
  const pollingData: PollingData = {
    image: '',
    timeStamp: '',
    inferenceRawData: '',
    inference: '',
    inferenceSeg: '',
    imageCount: 0
  }
  const delay = 5
  const setTimeoutId = setTimeout(() => {
    props.mode === REALTIME_MODE ? props.dispatch({ type: 'stopPlaying' }) : props.dispatch({ type: 'stopPlayingHistory' })
    abortContoroller.abort('TIMEOUT')
  }, (props.state.intervalTimeValue * 1000) - delay)
  try {
    let nextImageCount = 0
    if (props.mode === HISTORY_MODE) {
      if (props.state.isFirst) {
        props.dispatch({ type: 'notFirst' })
        nextImageCount = props.state.imageCount
      } else if (props.state.imageCount === props.state.totalCount - 1) {
        nextImageCount = 0
      } else {
        nextImageCount = props.state.imageCount + 1
      }
    }
    pollingData.imageCount = nextImageCount

    const signal = abortContoroller.signal

    if (CONNECTION_DESTINATION === SERVICE.Local && props.mode === REALTIME_MODE) {
      const data = await getImageAndInferenceAccordingInference(props.deviceId, props.state.imagePath, props.mode, props.aiTask, signal)
      pollingData.image = data.image
      pollingData.timeStamp = data.timestamp
      pollingData.inferenceRawData = data.inferenceRawData
      pollingData.inferenceSeg = data.inferenceSeg
      pollingData.inference = data.inference
    } else {
      const data = await getImageAndInferenceAccordingImage(props.deviceId, props.state.imagePath, props.mode, props.aiTask, nextImageCount, signal)
      pollingData.image = data.image
      pollingData.timeStamp = data.timestamp
      pollingData.inferenceRawData = data.inferenceRawData
      pollingData.inferenceSeg = data.inferenceSeg
      pollingData.inference = data.inference
    }
  } catch (e) {
    if (e instanceof DOMException) {
      if (abortContoroller.signal.reason === 'TIMEOUT' && props.mode === REALTIME_MODE) {
        handleResponseErr({ message: 'Communication timed out.\nPolling has stopped, but uploading continues.\nThe following may resolve the problem.\n1. Extend the Polling Interval.' })
        uploadHandler(props)
        props.setLoadingDialogFlg(true)
      } else if (abortContoroller.signal.reason === 'TIMEOUT' && props.mode === HISTORY_MODE) {
        handleResponseErr({ message: 'Communication timed out.\nThe following may resolve the problem.\n1. Extend the Polling Interval.\n2. Delete images in subDirectories.' })
      }
    } else {
      handleResponseErr({ message: 'An error has occurred.' })
    }
  }
  clearTimeout(setTimeoutId)
  return pollingData
}

export const setData = async (props: setDataProps) => {
  try {
    if (props.pollingData !== undefined) {
      const data = props.pollingData
      props.dispatch({ type: 'setImageCount', payload: { imageCount: data.imageCount } })
      if (props.aiTask === OBJECT_DETECTION) {
        props.setOdData({
          timestamp: data.timeStamp,
          image: data.image,
          inference: convertInferencesOD(data.inference),
          inferenceRawData: data.inferenceRawData,
          labelData: props.odData.labelData
        })
      } else if (props.aiTask === CLASSIFICATION) {
        props.setClsData({
          timestamp: data.timeStamp,
          image: data.image,
          inference: convertInferencesCls(data.inference),
          inferenceRawData: data.inferenceRawData,
          labelData: props.clsData.labelData
        })
      } else if (props.aiTask === SEGMENTATION) {
        props.setSegData({
          timestamp: data.timeStamp,
          image: data.image,
          inference: (typeof data.inferenceSeg !== 'string') ? data.inferenceSeg : undefined,
          inferenceRawData: data.inferenceRawData,
          labelData: props.segData.labelData
        })
      }
      props.setLoadingDialogFlg(false)
    }
  } catch (e) {
    console.log(e)
    handleResponseErr({ message: 'An error has occurred.' })
    props.setLoadingDialogFlg(false)
  }
}

export const updateDeviceIdList = async (props: UpdateDeviceIdListProps) => {
  props.setDeviceIds({ select: '', list: {} })
  props.setLoadingDialogFlg(true)
  const res = await fetch('/api/deviceInfo/deviceInfo', { method: 'GET' })
  props.setLoadingDialogFlg(false)
  if (res.status === 200) {
    await res.json().then((data) => {
      if (Object.keys(data).length === 0) {
        return window.alert('Connected Edge Device not found.')
      }
      props.setDeviceIds({ select: '', list: data })
    })
  } else {
    const errorMessage: ErrorData = await res.json()
    handleResponseErr(errorMessage)
  }
}

export const convertInferencesOD = (inferenceResults: {}): BoundingBoxProps[] => {
  const results: BoundingBoxProps[] = []
  Object.values(inferenceResults).forEach((value: any) => {
    const bbsElement: BoundingBoxProps = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      label: '',
      confidence: 0,
      bbStrokeColor: '',
      tagStrokeColor: '',
      tagTextColor: ''
    }

    bbsElement.x = value.left
    bbsElement.y = value.top
    bbsElement.width = Math.abs(value.left - value.right)
    bbsElement.height = Math.abs(value.bottom - value.top)
    bbsElement.label = value.class_id.toString()
    bbsElement.confidence = value.score
    bbsElement.bbStrokeColor = COLORS[value.class_id % COLORS.length][0]
    bbsElement.tagStrokeColor = COLORS[value.class_id % COLORS.length][0]
    bbsElement.tagTextColor = COLORS[value.class_id % COLORS.length][1]

    results.push(bbsElement)
  })
  return results
}

export const convertInferencesCls = (inferenceResults: {}): ClsInferenceProps[] => {
  const results: ClsInferenceProps[] = []
  Object.values(inferenceResults).forEach((value: any) => {
    const ccaElement: ClsInferenceProps = {
      label: '',
      confidence: 0
    }

    ccaElement.label = value.class_id.toString()
    ccaElement.confidence = value.score

    results.push(ccaElement)
  })
  return results
}

export const convertInferencesSEG = (inferenceResults: SegInferenceProps, index: number) => {
  let retrunIndex = -1
  let value = -1
  if (inferenceResults !== undefined && inferenceResults.numClassId !== undefined && inferenceResults.scoreMap !== undefined) {
    const numClassId = inferenceResults.numClassId
    const scoreMap = inferenceResults.scoreMap
    for (let i = 0; i < numClassId; i++) {
      if (scoreMap[index * numClassId + i] > value) {
        value = scoreMap[index * numClassId + i]
        retrunIndex = i
      }
    }
  }
  return retrunIndex
}

export const handleResponseErr = (err: ErrorData) => {
  console.error(err)
  let parseErrObj
  if (err.message) {
    alert(err.message)
  } else if (typeof err === 'string') {
    parseErrObj = JSON.parse(err)
    if (parseErrObj.message) {
      alert(parseErrObj.message)
    }
  }
}

const startUpload = async (props: UploadHandlerProps) => {
  try {
    const startUploadResponse = await fetch(`/api/startUploadInferenceResult/${props.deviceId}`, { method: 'POST' })
    if (startUploadResponse.status === 200) {
      const startUploadData = await startUploadResponse.json()
      const fullSubDir: string = startUploadData.outputSubDirectory
      const subDirList = fullSubDir.split('/')
      const subDir = subDirList[subDirList.length - 1]
      props.dispatch({ type: 'startUpload', payload: { imagePath: subDir } })
      setTimeout(() => {
        props.dispatch({ type: 'startPlaying' })
      }, 3000)
    } else {
      const errorMessage: ErrorData = await startUploadResponse.json()
      handleResponseErr(errorMessage)
      props.setLoadingDialogFlg(false)
    }
  } catch (e) {
    handleResponseErr({ message: 'An error has occurred.' })
  }
}

const stopUpload = async (props: UploadHandlerProps) => {
  try {
    const body = {
      subDirectory: props.state.imagePath
    }
    const stopUploadResponse = await fetch(`/api/stopUploadInferenceResult/${props.deviceId}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (stopUploadResponse.status === 200) {
      props.dispatch({ type: 'stopUpload' })
    } else {
      props.dispatch({ type: 'stopPlayingFailure' })
      const errorMessage: ErrorData = await stopUploadResponse.json()
      handleResponseErr(errorMessage)
    }
  } catch (e) {
    handleResponseErr({ message: 'An error has occurred.' })
  } finally {
    props.setLoadingDialogFlg(false)
  }
}

export const createZip = async (props: createZipProps) => {
  try {
    const opts = {
      suggestedName: `${props.subDirName}.zip`,
      types: [{
        description: 'zip file',
        accept: { 'application/zip': ['.zip'] }
      }]
    }

    const fss = await window.showSaveFilePicker(opts)
    props.setFs(fss)
  } catch (e: any) {
    console.error(e)
    if (e.message !== 'The user aborted a request.') {
      handleResponseErr({ message: 'An error has occurred.' })
    }
  }
}

export const writeZip = async (props: SaveDialogProps) => {
  try {
    const result = await fetch('/api/createZip/zipFile', { method: 'POST' })
    if (result.status === 200) {
      const response = await fetch('/api/zipData/zipData')

      if (!response.body || response.status !== 200) {
        const errorMessage: ErrorData = await response.json()
        return handleResponseErr(errorMessage)
      }
      if (props.fs !== undefined) {
        const reader = response.body.getReader()
        const stream = new ReadableStream({
          async start (controller) {
            let checkEnque = true
            while (checkEnque) {
              const { done, value } = await reader.read()
              if (done) {
                checkEnque = false
                continue
              }
              controller.enqueue(value)
            }
            controller.close()
            reader.releaseLock()
          }
        })
        const blob = await new Response(stream).blob()

        const writableStream = await props.fs.createWritable()
        await writableStream.write(blob)
        await writableStream.close()
        return true
      }
    }
  } catch (e) {
    console.error(e)
    handleResponseErr({ message: 'An error has occurred.' })
  }
  return false
}

const convertToString = (date: Date) => {
  const padding = function (str: string): string {
    return ('0' + str).slice(-2)
  }
  const year = date.getFullYear().toString()
  const month = padding((date.getMonth() + 1).toString())
  const day = padding(date.getDate().toString())
  const hour = padding(date.getHours().toString())
  const min = padding(date.getMinutes().toString())
  const sec = padding(date.getSeconds().toString())
  const msec = ('00' + date.getMilliseconds().toString()).slice(-3)
  return `${year}${month}${day}${hour}${min}${sec}${msec}`
}

const convertToDate = (dateString: string) => {
  if (dateString.length !== 17) {
    throw new Error('date length error')
  }
  return new Date(
    Number(dateString.substring(0, 4)),
    Number(dateString.substring(4, 6)) - 1,
    Number(dateString.substring(6, 8)),
    Number(dateString.substring(8, 10)),
    Number(dateString.substring(10, 12)),
    Number(dateString.substring(12, 14)),
    Number(dateString.substring(14, 17)))
}

export const getDateIncrement = (dateString: string) => {
  const date = convertToDate(dateString)
  date.setMilliseconds(date.getMilliseconds() + 1)
  return convertToString(date)
}

export const getDateDecrement = (dateString: string) => {
  const date = convertToDate(dateString)
  date.setMilliseconds(date.getMilliseconds() - 1)
  return convertToString(date)
}

export const settedLabelText = (label: string[], idx: number) => `${label[idx]}`

export const lavelTextCls = (labelData: string[], inferences: ClsInferenceProps[], probability: number) => {
  const highScore = inferences
    .filter((cls: ClsInferenceProps) => cls.confidence * 100 >= probability)
    .sort((a, b) => b.confidence - a.confidence)[0]
  if (highScore !== undefined) {
    return ` ${settedLabelText(labelData, Number(highScore.label))} `
  } else {
    return ''
  }
}

export const hexColorToDecArray = (labelListData: SegmentationLabelType) => {
  const decColorArr: number[] = []
  decColorArr.push(parseInt(labelListData.color.substring(1, 3), 16))
  decColorArr.push(parseInt(labelListData.color.substring(3, 5), 16))
  decColorArr.push(parseInt(labelListData.color.substring(5, 7), 16))
  decColorArr.push(labelListData.isVisible ? 255 : 0)
  return decColorArr
}

export const addIndent = (indent: number) => {
  let ret = ''
  const space4 = '    '
  for (let i = 0; i < indent; i++) {
    ret += space4
  }
  return ret
}

export function segStringifyArray (json: any, key: string, indent: number, column: number) {
  let data: string = ''

  const getMaxLength = () => {
    let val = 0
    json.forEach((value: number) => {
      val = (val > value.toString().length) ? val : value.toString().length
    })
    return val
  }
  const padNumber = getMaxLength()

  const getSpace = () => {
    let ret = ''
    for (let i = 0; i < padNumber; i++) {
      ret += ' '
    }
    return ret
  }
  const space = getSpace()

  const pad = (str: number) => {
    return (space + str).slice(-space.length)
  }

  data += addIndent(indent) + '"' + key + '": [\n'
  const length = json.length
  for (let i = 0; i < length; i++) {
    const rest = i % column
    if (column === 1) {
      data += addIndent(indent + 1) + json[i]
      data += (i === length - 1) ? '\n' : ',\n'
    } else if (rest === 0) {
      data += addIndent(indent + 1) + pad(json[i])
      data += (i === length - 1) ? '\n' : ','
    } else if (rest === column - 1) {
      data += ' ' + pad(json[i])
      data += (i === length - 1) ? '\n' : ',\n'
    } else {
      data += ' ' + pad(json[i])
      data += (i === length - 1) ? '\n' : ','
    }
  }
  data += addIndent(indent) + ']'
  return data
}

export function segStringify (json: any, key: string = '', indent: number = 0) {
  if (json === undefined || json === null) {
    return ''
  }

  const escape = (str: string) => {
    // eslint-disable-next-line
    return str.replace(/[\n"\&\r\t\b\f]/g, '\\$&')
  }

  const isArray = json.length !== undefined
  const startSentence = isArray ? '[' : '{'
  const endSentence = isArray ? ']' : '}'

  let data: string = ''
  if (key !== '') {
    data += addIndent(indent) + '"' + key + '": ' + startSentence + '\n'
  } else {
    data += addIndent(indent) + startSentence + '\n'
  }
  for (let i = 0; i < Object.keys(json).length; i++) {
    if (typeof json[Object.keys(json)[i]] === 'object') {
      if (Object.keys(json)[i] === 'classIdMap') {
        data += segStringifyArray(json[Object.keys(json)[i]], Object.keys(json)[i], indent + 1, json.width)
      } else if (Object.keys(json)[i] === 'scoreMap') {
        data += segStringifyArray(json[Object.keys(json)[i]], Object.keys(json)[i], indent + 1, json.numClassId)
      } else {
        data += segStringify(json[Object.keys(json)[i]], isArray ? '' : Object.keys(json)[i], indent + 1)
      }
    } else if (typeof json[Object.keys(json)[i]] === 'string') {
      data += addIndent(indent + 1)
      if (!isArray) {
        data += '"' + Object.keys(json)[i] + '": '
      }
      data += '"' + escape(json[Object.keys(json)[i]]) + '"'
    } else {
      data += addIndent(indent + 1)
      if (!isArray) {
        data += '"' + Object.keys(json)[i] + '": '
      }
      data += json[Object.keys(json)[i]]
    }
    data += (i === Object.keys(json).length - 1) ? '\n' : ',\n'
  }
  data += addIndent(indent) + endSentence
  return data
}

export function convertDate (subDir: string) {
  const convertedFromDate = new Date(
    Number(subDir.slice(0, 4)),
    Number(subDir.slice(4, 6)) - 1,
    Number(subDir.slice(6, 8)),
    Number(subDir.slice(8, 10)),
    Number(subDir.slice(10, 12)),
    Number(subDir.slice(12, 14)),
    Number(subDir.slice(14, 17))
  )
  return convertedFromDate
}
