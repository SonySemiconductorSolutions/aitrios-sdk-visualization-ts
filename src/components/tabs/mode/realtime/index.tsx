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

import React, { useEffect } from 'react'
import { ErrorData, handleResponseErr, uploadHandler, DeviceListData } from '../../../../hooks/util'
import { REALTIME_MODE } from '../../../../pages'
import DefaultButton from '../../../common/button/defaultbutton'
import StartPlayingSVG from '../../../common/button/defaultbutton/startplaying-svg'
import StopPlayingSVG from '../../../common/button/defaultbutton/stopplaying-svg'
import StartUploadSVG from '../../../common/button/defaultbutton/startupload-svg'
import CustomSlider from '../../../common/slider'
import TimerSVG from '../../../common/slider/timer-svg'
import styles from './realtime.module.scss'
import StopUploadSVG from '../../../common/button/defaultbutton/stopupload-svg'

type RealtimeProps = {
  deviceId: string
  subDirectory: string
  setDeviceId: (deviceId: string) => void
  deviceIdList: DeviceListData
  setDeviceIdList: (deviceListData: DeviceListData) => void
  isPlaying: boolean
  mode: string
  intervalTimeValue: number
  isLoading: boolean
  isUploading: boolean
  setIsPlaying: (isPlaying: boolean) => void
  setImagePath: (isImagePath: string) => void
  setIsUploading: (uploading: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  setIntervalTimeValue: (interval: number) => void
  setLoadingDialogFlg: (display: boolean) => void
}

export default function Realtime (props: RealtimeProps) {
  useEffect(() => {
    if (props.mode === REALTIME_MODE) {
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
    }
  }, [props.mode])

  return (
    <div>
      <div className={styles['items-container']}>
        Polling Interval (seconds)
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
      <div>
        <div className={styles['items-container']}>
          <DefaultButton
            isLoading={props.isLoading}
            icon={!props.isUploading ? <StartUploadSVG /> : <StopUploadSVG />}
            text={!props.isUploading ? 'Start Upload' : 'Stop Upload'}
            disabled={props.isLoading}
            action={() => {
              uploadHandler({
                isUploading: props.isUploading,
                deviceId: props.deviceId,
                subDirectory: props.subDirectory,
                isPlaying: props.isPlaying,
                setIsUploading: props.setIsUploading,
                setIsLoading: props.setIsLoading,
                setImagePath: props.setImagePath,
                setIsPlaying: props.setIsPlaying,
                setLoadingDialogFlg: props.setLoadingDialogFlg
              })
              if (props.deviceId) {
                props.setLoadingDialogFlg(true)
                props.setIsUploading(false)
                props.setIsPlaying(false)
              }
            }}
          />
          <DefaultButton isLoading={false}
            icon={!props.isPlaying ? <StartPlayingSVG /> : <StopPlayingSVG />}
            text={!props.isPlaying ? 'Start Polling' : 'Stop Polling'}
            disabled={!props.isUploading}
            action={() => {
              if (!props.isPlaying) {
                props.setLoadingDialogFlg(true)
              }
              props.setIsPlaying(!props.isPlaying)
            }
            }
          />
        </div>
      </div>
    </div>
  )
}
