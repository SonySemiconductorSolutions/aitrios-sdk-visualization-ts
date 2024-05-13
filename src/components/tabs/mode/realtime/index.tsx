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

import React, { useContext, useCallback } from 'react'
import { uploadHandler } from '../../../../hooks/util'
import { MIN_INTERVAL_SEC, MAX_INTERVAL_SEC, STEP_INTERVAL_SEC, MIN_HISH_FPS_INTERVAL_SEC, STEP_HISH_FPS_INTERVAL_SEC } from '../../../../common/constants'
import DefaultButton from '../../../common/button/defaultbutton'
import StartUploadSVG from '../../../common/button/defaultbutton/startupload-svg'
import CustomSlider from '../../../common/slider'
import TimerSVG from '../../../common/slider/timer-svg'
import styles from './realtime.module.scss'
import StopUploadSVG from '../../../common/button/defaultbutton/stopupload-svg'
import { UserContext } from '../../../../hooks/context'
import { State, Action } from '../../../../hooks/reducer'
import { CONNECTION_DESTINATION, SERVICE } from '../../../../common/settings'

type RealtimeProps = {
  deviceId: string
  state: State
  dispatch: React.Dispatch<Action>
  isLoading: boolean
}

export default function Realtime (props: RealtimeProps) {
  const { setLoadingDialogFlg } = useContext(UserContext)
  const { setIsLoading } = useContext(UserContext)

  const handleUpdateInterval = useCallback((currValue: number) => {
    props.dispatch({ type: 'setIntervalTimeValue', payload: { intervalTimeValue: currValue } })
  }, [])

  return (
    <div>
      <div className={styles['items-container']}>
        Polling Interval (seconds)
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
      <div>
        <div className={styles['items-container']}>
          <DefaultButton
            isLoading={props.isLoading}
            icon={!props.state.isUploading ? <StartUploadSVG /> : <StopUploadSVG />}
            text={!props.state.isUploading ? 'Start Upload' : 'Stop Upload'}
            disabled={props.isLoading}
            action={() => {
              uploadHandler({
                deviceId: props.deviceId,
                setIsLoading,
                setLoadingDialogFlg,
                state: props.state,
                dispatch: props.dispatch
              })
              if (props.deviceId) {
                setLoadingDialogFlg(true)
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
