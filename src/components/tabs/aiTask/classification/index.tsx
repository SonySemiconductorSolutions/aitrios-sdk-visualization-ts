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

import { List, ListItem, Progress, Textarea, Button } from '@chakra-ui/react'
import React, { useEffect, useState, useContext } from 'react'
import { ClsInferenceProps, ClassficationProps, lavelTextCls, settedLabelText, handleFileInputChangeODorCLS, exportLabelDataODorCLS } from '../../../../hooks/util'
import styles from './classfication.module.scss'
import { Stage, Layer, Image, Text } from 'react-konva'
import { CLASSIFICATION } from '../../../../common/constants'
import { UserContext } from '../../../../hooks/context'

export const ROWDATA_EXPLANATION = 'Inference Result'
export const LABEL_EXPLANATION = 'Label Setting'

export default function Classification (props: ClassficationProps) {
  const { aiTask } = useContext(UserContext)
  const [labelTextCLS, setLabelTextCLS] = useState<string>(JSON.stringify(props.data.labelData).replace(/"|\[|\]/g, '').replace(/,/g, '\n'))
  const [inferences, setInferences] = useState<ClsInferenceProps[] | undefined>()
  const [rawData, setRawData] = useState<string>()
  const [timeStamp, setTimeStamp] = useState<string>('')
  const [canvasWidth, setCanvasWidth] = useState<number>(264)
  const [canvasHeight, setCanvasHeight] = useState<number>(264)
  const [state, setState] = useState<HTMLImageElement>()
  const SCALE = 1

  useEffect(() => {
    props.setData((prevState: any) => ({ ...prevState, labelData: labelTextCLS.split(/\n/) }))
  }, [labelTextCLS])

  useEffect(() => {
    if (typeof window !== 'undefined' && aiTask === CLASSIFICATION) {
      const image = new window.Image()

      if (typeof props.data.image === 'string') {
        image.src = props.data.image
      }

      image.onload = () => {
        setState(image)
        setTimeStamp(props.data.timestamp)
        setCanvasWidth(image.width)
        setCanvasHeight(image.height)
        setInferences(props.data.inference)
        setRawData(props.data.inferenceRawData)
        props.dispatch({ type: 'updateDisplayCount' })
      }
    }
  }, [props.data.image])

  return (
    <div className={styles['classfication-container']}>
      <div className={styles['upper-items']}>
        <div className={styles['timestamp-area']}>
          {props.displaySetting.isDisplayTs === true
            ? <div className={styles['timestamp-area']}>Timestamp:{timeStamp}</div>
            : null
          }
        </div>
      </div>
      <div className={styles['middle-items']}>
        <div style={{ border: '1px solid black', width: canvasWidth, height: canvasHeight }}>
          {props.data.image.length !== 0
            ? <Stage width={canvasWidth} height={canvasHeight} scaleX={SCALE} scaleY={SCALE}>
              <Layer>
                <Image
                  image={state}
                />
              </Layer>
              <Layer>
                {props.displaySetting.isOverlayIR && inferences !== undefined
                  ? <Text
                    fill={props.displaySetting.overlayIRC}
                    fontSize={30}
                    y={100}
                    width={canvasWidth}
                    wrap={'none'}
                    ellipsis={true}
                    text={lavelTextCls(props.data.labelData, inferences, props.displaySetting.probability)}
                  />
                  : null
                }
              </Layer>
            </Stage>

            : <div style={{ fontSize: '14px' }}>Not found image data</div>
          }
        </div>
        <div className={styles['inference-data-list']}>
          {inferences !== undefined
            ? inferences
              .filter((cls: ClsInferenceProps) => Math.round(cls.confidence * 1000000) / 10000 >= props.displaySetting.probability)
              .sort(function (a, b) { return b.confidence - a.confidence })
              .slice(0, props.displaySetting.displayScore)
              .map((jsonItem, index) => {
                return <List key={index}>
                  <ListItem>
                    <div className={styles['inference-parameter']}>
                      <div className={styles['inference-parameter-name']}>{` ${settedLabelText(props.data.labelData, Number(jsonItem.label))} `}</div>
                      <div className={styles['inference-parameter-percentage']}>{Math.round(jsonItem.confidence * 1000000) / 10000}%</div>
                    </div>
                    {<Progress colorScheme='green' value={jsonItem.confidence * 100} />}
                  </ListItem>
                </List>
              })
            : <div style={{ fontSize: '14px' }}>Not found inferences list data</div>
          }
        </ div>
      </div>
      <div className={styles['lower-items']}>
        <div className={styles['left-item']}>
          <div>{ROWDATA_EXPLANATION}</div>
          <Textarea className={styles['raw-data']} defaultValue={JSON.stringify((rawData), null, '\t')} readOnly resize="none" />
        </div>
        <div className={styles['right-item']}>
          <div>{LABEL_EXPLANATION}</div>
          <Textarea className={styles['label-area']} value={labelTextCLS} onChange={((event) => setLabelTextCLS(event.target.value))} resize="none" />
          <div className={styles['button-area']}>
            <Button
              onClick={() => document.getElementById('fileInputCLS')?.click()}
              style={{ color: '#ffffff', backgroundColor: '#2d78be' }}
              variant='solid'
              size='md'
              m={'2'}
            >
              Import Labels
              <input
                id='fileInputCLS'
                type='file'
                accept='.json'
                style={{ display: 'none' }}
                onChange={(event) => handleFileInputChangeODorCLS(event, setLabelTextCLS)}
              />
            </Button>
            <Button
              onClick={() => exportLabelDataODorCLS(props.data.labelData)}
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
