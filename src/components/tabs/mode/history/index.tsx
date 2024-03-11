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

import React, { useEffect, useRef, useState } from 'react'
import { ErrorData, handleResponseErr, SegmentationLabelType, DeviceListData } from '../../../../hooks/util'
import { HISTORY_MODE } from '../../../../pages'
import DefaultButton from '../../../common/button/defaultbutton'
import StartPlayingSVG from '../../../common/button/defaultbutton/startplaying-svg'
import StopPlayingSVG from '../../../common/button/defaultbutton/stopplaying-svg'
import DropDownList from '../../../common/dropdownlist'
import SaveMenu from '../../../common/menu/savemenu'
import CustomSlider from '../../../common/slider'
import ImageSVG from '../../../common/slider/image-svg'
import TimerSVG from '../../../common/slider/timer-svg'
import styles from './history.module.scss'

type HistoryProps = {
  deviceId: string
  setDeviceId: (deviceId: string) => void
  deviceIdList: DeviceListData
  setDeviceIdList: (deviceListData: DeviceListData) => void
  isPlaying: boolean
  mode: string
  intervalTimeValue: number
  subDirectory: string
  imageCount: number
  totalCount: number
  isFirst: boolean
  displayCount: number
  setIsPlaying: (playing: boolean) => void
  setSubDirectory: (subDirectory: string) => void
  setImageCount: (currValue: number) => void
  setTotalCount: (totalImageCount: number) => void
  setIntervalTimeValue: (interval: number) => void
  setLoadingDialogFlg: (display: boolean) => void
  setIsFirst: (isFirst: boolean) => void
  setDisplayCount: (displayCount: number) => void
  aiTask: string
  labelDataOD:string[]
  labelDataCLS:string[]
  labelDataSEG: SegmentationLabelType[]
  isDisplayTs:boolean
  probability:number
  isOverlayIR:boolean
  overlayIRC:string
  transparency: number
}

function getSubdirectoryList (props: HistoryProps, setSubDirectoryList: React.Dispatch<React.SetStateAction<string[]>>) {
  (async () => {
    setSubDirectoryList([])
    props.setSubDirectory('')
    if (props.deviceId && props.mode === HISTORY_MODE) {
      props.setLoadingDialogFlg(true)
      const res = await fetch(`/api/subDirectoryList/${props.deviceId}`, { method: 'GET' })
      props.setLoadingDialogFlg(false)
      if (res.status === 200) {
        await res.json().then((data) => {
          if (data.length === 0) {
            return window.alert('Sub Directory not found.')
          }
          setSubDirectoryList(data)
        })
      } else {
        const errorMessage: ErrorData = await res.json()
        handleResponseErr(errorMessage)
      }
    }
  })()
}

export default function History (props: HistoryProps) {
  const [subDirectoryList, setSubDirectoryList] = useState<string[]>([])
  const totalCountRenderFlgRef = useRef(false)

  useEffect(() => {
    if (props.mode === HISTORY_MODE) {
      if (Object.keys(props.deviceIdList).length === 0) {
        (async () => {
          props.setDeviceId('')
          props.setDeviceIdList({})
          props.setLoadingDialogFlg(true)
          const res = await fetch('/api/deviceInfo/deviceInfo', { method: 'GET' })
          props.setLoadingDialogFlg(false)
          if (res.status === 200) {
            await res.json().then((data) => {
              if (Object.keys(data).length === 0) {
                return window.alert('Connected device not found.')
              }
              props.setDeviceIdList(data)
            })
          } else {
            const errorMessage: ErrorData = await res.json()
            handleResponseErr(errorMessage)
          }
        })()
      }
      getSubdirectoryList(props, setSubDirectoryList)
    }
  }, [props.mode])

  useEffect(() => {
    getSubdirectoryList(props, setSubDirectoryList)
  }, [props.deviceId])

  useEffect(() => {
    if (props.mode === HISTORY_MODE && !props.isPlaying) {
      props.setIsFirst(true)
    }
  }, [props.isPlaying])

  useEffect(() => {
    (async () => {
      if (props.deviceId && props.subDirectory && totalCountRenderFlgRef.current && props.mode === HISTORY_MODE) {
        props.setLoadingDialogFlg(true)
        const res = await fetch(`/api/totalImageCount/${props.deviceId}?subDirectory=${props.subDirectory}`, { method: 'GET' })
        props.setLoadingDialogFlg(false)
        if (res.status === 200) {
          await res.json().then((data) => {
            if (data.totalImageCount === 0) {
              return window.alert('No images in subdirectory')
            }
            props.setImageCount(0)
            props.setDisplayCount(0)
            props.setTotalCount(data.totalImageCount)
          })
        } else {
          const errorMessage: ErrorData = await res.json()
          handleResponseErr(errorMessage)
        }
      } else {
        totalCountRenderFlgRef.current = true
      }
    })()
  }, [props.subDirectory])

  return (
    <div>
      <div className={styles['image-selection-area']}>
        <div>
          Image Selection
        </div>
        <div className={styles['subdirectory-area']}>
          Sub Directory
          <DropDownList
            id={'subdirectory-list'}
            name={'subDirectory'} className={props.isPlaying ? styles.disabled : styles.select}
            list={subDirectoryList}
            onChange={(event) => { props.setSubDirectory(event.target.value) }}
            disabled={props.isPlaying}
            defaultSpace= {true}
          />
        </div>
        <div className={styles['image-selection-slider']}>
          <CustomSlider
            icon={<ImageSVG />}
            isPlaying={props.isPlaying}
            currValue={props.displayCount}
            setCurrValue={props.setDisplayCount}
            max={props.totalCount - 1}
          />
          <div className={styles['unit-area']}>
            {` ${props.displayCount + 1} `}
          </div>
        </div>
      </div>
      <div>
        <div className={styles['items-container']}>
          Interval Time (seconds)
          <div className={styles['interval-slider']}>
            <CustomSlider icon={<TimerSVG />}
              isPlaying={props.isPlaying}
              currValue={props.intervalTimeValue}
              setCurrValue={props.setIntervalTimeValue}
              min={10}
              max={120}
            />
            <div className={styles['unit-area']}>
              {`${props.intervalTimeValue} sec`}
            </div>
          </div>
        </div>
        <div className={styles['items-container']}>
          <DefaultButton isLoading={false}
            icon={!props.isPlaying ? <StartPlayingSVG /> : <StopPlayingSVG />}
            text={!props.isPlaying ? 'Start Playing' : 'Stop Playing'}
            disabled={!props.subDirectory}
            action={() => {
              props.setLoadingDialogFlg(true)
              props.setImageCount(props.displayCount)
              props.setIsPlaying(!props.isPlaying)
            }
            } />
        </div>
        <div className={styles['items-container']}>
          <SaveMenu
            deviceId={props.deviceId}
            max={props.totalCount}
            subDirectory={props.subDirectory}
            aiTask={props.aiTask}
            labelDataOD={props.labelDataOD}
            labelDataCLS={props.labelDataCLS}
            labelDataSEG={props.labelDataSEG}
            isDisplayTs={props.isDisplayTs}
            probability={props.probability}
            isOverlayIR={props.isOverlayIR}
            overlayIRC={props.overlayIRC}
            transparency={props.transparency}
          />
        </div>
      </div>
    </div>
  )
}
