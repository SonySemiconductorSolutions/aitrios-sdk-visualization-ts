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

import React, { useEffect, useState, useContext } from 'react'
import { Textarea, Button } from '@chakra-ui/react'
import DropDownList from '../../../common/dropdownlist'
import LabelTable from '../../../common/labelTable'
import styles from './segmentation.module.scss'
import { Stage, Layer, Image } from 'react-konva'
import {
  SegmentationProps,
  handleFileInputChangeSegmentation,
  exportLabelDataSegmentation,
  lineAddClickEvent,
  delLineClickEvent,
  updateIsVisible,
  updateLabel,
  updateColor,
  convertInferencesSEG,
  hexColorToDecArray,
  segStringify
} from '../../../../hooks/util'
import { SEGMENTATION } from '../../../../common/constants'
import { UserContext } from '../../../../hooks/context'

export const ROWDATA_EXPLANATION = 'Inference Result'
export default function Segmentation (props: SegmentationProps) {
  const { aiTask } = useContext(UserContext)
  const [addNumber, setAddNumber] = useState<number>(0)
  const [delNumber, setDelNumber] = useState<number>(0)
  const [lineNumber, setLineNumber] = useState<number[]>([])
  const [addLineNumber, setAddLineNumber] = useState<number[]>([])
  const MARGIN = 20
  const SCALE = 2
  const [image, setImage] = useState<HTMLImageElement>()
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement>()
  const [canvasWidth, setCanvasWidth] = useState<number>(290)
  const [canvasHeight, setCanvasHeight] = useState<number>(290)
  const [labelColorsArr, setLabelColorsArr] = useState<number[][]>([])
  const [rawData, setRawData] = useState<string | undefined>(undefined)
  const [timeStamp, setTimeStamp] = useState<string>('')

  useEffect(() => {
    const length = props.data.labelData.length
    const addLength = length + 1
    const arr = Array.from({ length }, (_, index) => index)
    const addArr = Array.from({ length: addLength }, (_, index) => index)
    setLineNumber(arr)
    setAddLineNumber(addArr)
    setAddNumber(addArr.length - 1)
    setDelNumber(arr.length - 1)

    const newLabelColorsArr: number[][] = []
    props.data.labelData.forEach(elm => {
      newLabelColorsArr.push(hexColorToDecArray(elm))
    })
    setLabelColorsArr([...newLabelColorsArr])
  }, [props.data.labelData])

  useEffect(() => {
    if (typeof window !== 'undefined' && aiTask === SEGMENTATION) {
      const image = new window.Image()
      const overlayImage = new window.Image()
      if (typeof props.data.image === 'string') {
        image.src = props.data.image
      }
      image.onload = () => {
        if (props.data.inference === undefined || !props.data.inference.width || !props.data.inference.height) {
          setOverlayImage(undefined)
        } else {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = props.data.inference.width
          canvas.height = props.data.inference.height
          const overImage = ctx!.createImageData(props.data.inference.width, props.data.inference.height)
          const d = overImage.data
          if (props.data.inference.scoreMap?.length === 0 && labelColorsArr.length !== 0) {
            for (let i = 0; i < d.length; i += 4) {
              const id = props.data.inference.classIdMap[i / 4]
              if (labelColorsArr[id] === undefined) continue
              d[i] = labelColorsArr[id][0] // red
              d[i + 1] = labelColorsArr[id][1] // green
              d[i + 2] = labelColorsArr[id][2] // blue
              d[i + 3] = labelColorsArr[id][3] // alpha
            }
          } else if (props.data.inference.numClassId !== 0 && labelColorsArr.length !== 0) {
            const inference = props.data.inference
            for (let i = 0; i < d.length; i += 4) {
              const maxClassId = convertInferencesSEG(inference, i / 4)
              if (labelColorsArr[maxClassId] === undefined) continue
              d[i] = labelColorsArr[maxClassId][0]
              d[i + 1] = labelColorsArr[maxClassId][1]
              d[i + 2] = labelColorsArr[maxClassId][2]
              d[i + 3] = labelColorsArr[maxClassId][3]
            }
          }
          ctx!.putImageData(overImage, 0, 0)
          const data = canvas.toDataURL()
          overlayImage.src = data
          setOverlayImage(overlayImage)
        }
        setImage(image)
        setCanvasWidth(image.width * SCALE + MARGIN * 2)
        setCanvasHeight(image.height * SCALE + MARGIN * 2)
        setRawData(props.data.inferenceRawData)
        setTimeStamp(props.data.timestamp)
        props.dispatch({ type: 'updateDisplayCount' })
      }
    }
  }, [props.data.image, labelColorsArr])

  return (
    <div className={styles['segmentation-container']}>
      {props.displaySetting.isDisplayTs === true
        ? <div className={styles['timestamp-area']}>Timestamp:{timeStamp}</div>
        : null
      }
      <div className={styles['upper-items']}>
        <div style={{ border: '1px solid black', width: canvasWidth, height: canvasHeight }}>
          {props.data.image.length !== 0
            ? <Stage width={canvasWidth} height={canvasHeight} x={MARGIN} y={MARGIN} scaleX={SCALE} scaleY={SCALE}>
              <Layer>
                <Image image={image} />
                <Image image={overlayImage} opacity={1 - (props.displaySetting.transparency / 100)}
                />
              </Layer>
            </Stage>
            : <div style={{ fontSize: '14px' }}>Not found image data</div>
          }
        </div>
        <p style={{ fontSize: '12px', color: '#8a8c99' }}>Image size magnification x2</p>
      </div>
      <div className={styles['lower-items']}>
        <div className={styles['left-item']}>
          <div>{ROWDATA_EXPLANATION}</div>
          <Textarea className={styles['raw-data']} value={segStringify(rawData)} readOnly resize="none" />
        </div>
        <div className={styles['right-item']}>
          <h1 className="title">Label Table</h1>
          <div className={styles['table-area']}>
            <LabelTable
              headerList={['Visible', 'Id', 'Label', 'Color']}
              data={props.data}
              setData={props.setData}
              updateIsVisible={updateIsVisible}
              updateLabel={updateLabel}
              updateColor={updateColor}
            />
          </div>
          <div className={styles['button-area']}>
            <DropDownList
              id={'Add-list'}
              name={'Add'}
              className={styles.select}
              list={addLineNumber}
              onChange={(event) => { setAddNumber(Number(event.target.value)) }}
              disabled={false}
              value={addNumber}
              defaultSpace={false}
            />
            <Button
              onClick={() => lineAddClickEvent(props.data, props.setData, addNumber)}
              style={{ color: '#ffffff', backgroundColor: '#2d78be' }}
              variant='solid'
              size='sm'
            >
              Add Label
            </Button>
            <DropDownList
              id={'delete-list'}
              name={'Delete'}
              className={styles.select}
              list={lineNumber}
              onChange={(event) => { setDelNumber(Number(event.target.value)) }}
              disabled={false}
              value={delNumber}
              defaultSpace={false}
            />
            <Button
              onClick={() => delLineClickEvent(props.data, props.setData, delNumber, setDelNumber)}
              style={{ color: '#ffffff', backgroundColor: '#2d78be' }}
              variant='solid'
              size='sm'
            >
              Delete Label
            </Button>
          </div>
          <div className={styles['button-area']}>
            <Button
              onClick={() => document.getElementById('fileInputSegmentation')?.click()}
              style={{ color: '#ffffff', backgroundColor: '#2d78be' }}
              variant='solid'
              size='md'
              m={'2'}
            >
              Import Labels
              <input
                id='fileInputSegmentation'
                type='file'
                accept='.json'
                style={{ display: 'none' }}
                onChange={(event) => handleFileInputChangeSegmentation(event, props.data, props.setData)}
              />
            </Button>
            <Button
              onClick={() => exportLabelDataSegmentation(props.data.labelData)}
              style={{ color: '#ffffff', backgroundColor: '#2d78be' }}
              variant='solid'
              size='md'
              m={'2'}
            >
              Export Labels
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
