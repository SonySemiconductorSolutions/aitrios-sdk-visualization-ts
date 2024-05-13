/*
 * Copyright 2022, 2023, 2024 Sony Semiconductor Solutions Corp. All rights reserved.
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

import React, { useEffect, useRef, useState, useContext, useCallback } from 'react'
import { ErrorData, handleResponseErr, SegmentationLabelType, DisplaySetting } from '../../../../hooks/util'
import { HISTORY_MODE, MIN_INTERVAL_SEC, MAX_INTERVAL_SEC, STEP_INTERVAL_SEC, MIN_HISH_FPS_INTERVAL_SEC, STEP_HISH_FPS_INTERVAL_SEC } from '../../../../common/constants'
import DefaultButton from '../../../common/button/defaultbutton'
import StartPlayingSVG from '../../../common/button/defaultbutton/startplaying-svg'
import StopPlayingSVG from '../../../common/button/defaultbutton/stopplaying-svg'
import DropDownList from '../../../common/dropdownlist'
import SaveMenu from '../../../common/menu/savemenu'
import CustomSlider from '../../../common/slider'
import ImageSVG from '../../../common/slider/image-svg'
import TimerSVG from '../../../common/slider/timer-svg'
import styles from './history.module.scss'
import { UserContext } from '../../../../hooks/context'
import { State, Action } from '../../../../hooks/reducer'
import { CONNECTION_DESTINATION, SERVICE } from '../../../../common/settings'

type HistoryProps = {
  deviceId: string
  labelDataOD: string[]
  labelDataCLS: string[]
  labelDataSEG: SegmentationLabelType[]
  displaySetting: DisplaySetting
  state: State
  dispatch: React.Dispatch<Action>
}

export default function History (props: HistoryProps) {
  const { aiTask, mode, setLoadingDialogFlg } = useContext(UserContext)
  const [subDirectoryList, setSubDirectoryList] = useState<string[]>([])
  const totalCountRenderFlgRef = useRef(false)

  const getSubdirectoryList = () => {
    (async () => {
      setSubDirectoryList([])
      props.dispatch({ type: 'setImagePath', payload: { imagePath: '' } })
      if (props.deviceId && mode === HISTORY_MODE) {
        setLoadingDialogFlg(true)
        const res = await fetch(`/api/subDirectoryList/${props.deviceId}`, { method: 'GET' })
        setLoadingDialogFlg(false)
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

  useEffect(() => {
    if (mode === HISTORY_MODE) {
      getSubdirectoryList()
    }
  }, [props.deviceId, mode])

  useEffect(() => {
    if (mode === HISTORY_MODE && !props.state.isPlaying) {
      props.dispatch({ type: 'clearFirst' })
    }
  }, [props.state.isPlaying])

  useEffect(() => {
    (async () => {
      if (props.deviceId && props.state.imagePath && totalCountRenderFlgRef.current && mode === HISTORY_MODE) {
        setLoadingDialogFlg(true)
        const res = await fetch(`/api/totalImageCount/${props.deviceId}?subDirectory=${props.state.imagePath}`, { method: 'GET' })
        setLoadingDialogFlg(false)
        if (res.status === 200) {
          await res.json().then((data) => {
            if (data.totalImageCount === 0) {
              return window.alert('No images in subdirectory')
            }
            props.dispatch({ type: 'setTotalCount', payload: { totalCount: data.totalImageCount } })
          })
        } else {
          const errorMessage: ErrorData = await res.json()
          handleResponseErr(errorMessage)
        }
      } else {
        totalCountRenderFlgRef.current = true
      }
    })()
  }, [props.state.imagePath])

  const handleUpdateDisplayCount = useCallback((currValue: number) => {
    props.dispatch({ type: 'setDisplayCount', payload: { displayCount: currValue } })
  }, [])

  const handleUpdateInterval = useCallback((currValue: number) => {
    props.dispatch({ type: 'setIntervalTimeValue', payload: { intervalTimeValue: currValue } })
  }, [])

  const handleUpdateImagePath = useCallback((value: string) => {
    props.dispatch({ type: 'setImagePath', payload: { imagePath: value } })
  }, [])

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
            name={'subDirectory'} className={props.state.isPlaying ? styles.disabled : styles.select}
            list={subDirectoryList}
            onChange={(event) => {
              handleUpdateImagePath(event.target.value)
            }}
            disabled={props.state.isPlaying}
            defaultSpace={true}
          />
        </div>
        <div className={styles['image-selection-slider']}>
          <CustomSlider
            icon={<ImageSVG />}
            isPlaying={props.state.isPlaying}
            currValue={props.state.displayCount}
            setCurrValue={handleUpdateDisplayCount}
            max={props.state.totalCount - 1}
          />
          <div className={styles['unit-area']}>
            {` ${props.state.displayCount + 1} `}
          </div>
        </div>
      </div>
      <div>
        <div className={styles['items-container']}>
          Interval Time (seconds)
          <div className={styles['interval-slider']}>
            <CustomSlider icon={<TimerSVG />}
              isPlaying={props.state.isPlaying}
              currValue={props.state.intervalTimeValue}
              setCurrValue={handleUpdateInterval}
              min={CONNECTION_DESTINATION === SERVICE.Local ? MIN_HISH_FPS_INTERVAL_SEC : MIN_INTERVAL_SEC}
              max={MAX_INTERVAL_SEC}
              step={CONNECTION_DESTINATION === SERVICE.Local ? STEP_HISH_FPS_INTERVAL_SEC : STEP_INTERVAL_SEC}
            />
            <div className={styles['unit-area']}>
              {`${props.state.intervalTimeValue} sec`}
            </div>
          </div>
        </div>
        <div className={styles['items-container']}>
          <DefaultButton isLoading={false}
            icon={!props.state.isPlaying ? <StartPlayingSVG /> : <StopPlayingSVG />}
            text={!props.state.isPlaying ? 'Start Playing' : 'Stop Playing'}
            disabled={!props.state.imagePath}
            action={() => {
              setLoadingDialogFlg(true)
              if (!props.state.isPlaying) {
                props.dispatch({ type: 'startPlayingHistory' })
              } else {
                props.dispatch({ type: 'stopPlayingHistory' })
              }
            }
            } />
        </div>
        <div className={styles['items-container']}>
          <SaveMenu
            deviceId={props.deviceId}
            max={props.state.totalCount}
            subDirectory={props.state.imagePath}
            isPlaying={props.state.isPlaying}
            aiTask={aiTask}
            labelDataOD={props.labelDataOD}
            labelDataCLS={props.labelDataCLS}
            labelDataSEG={props.labelDataSEG}
            isDisplayTs={props.displaySetting.isDisplayTs}
            probability={props.displaySetting.probability}
            isOverlayIR={props.displaySetting.isOverlayIR}
            overlayIRC={props.displaySetting.overlayIRC}
            transparency={props.displaySetting.transparency}
          />
        </div>
      </div>
    </div>
  )
}
