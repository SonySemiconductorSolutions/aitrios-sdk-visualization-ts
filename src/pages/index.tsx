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

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import React, { useEffect, useState, useReducer } from 'react'
import LoadingDialog from '../components/common/dialog/loading'
import Layout from '../components/common/layout'
import SettingMenu from '../components/common/menu/settingmenu'
import DropDownList from '../components/common/dropdownlist'
import DefaultButton from '../components/common/button/defaultbutton'
import ReloadSVG from '../components/common/button/defaultbutton/reload-svg'
import ObjectDetection from '../components/tabs/aiTask/objectdetection'
import History from '../components/tabs/mode/history'
import Realtime from '../components/tabs/mode/realtime'
import useInterval from '../hooks/useInterval'
import { AiTaskTabType, AiTaskTab, REALTIME_MODE, HISTORY_MODE, ModeTab, ModeTabType, DEFAULT_INTERVAL_SEC } from '../common/constants'
import { PollingData, PollingHandlerProps, pollingHandler, setData, updateDeviceIdList, DeviceIds, DisplaySetting, OdData, ClsData, SegData } from '../hooks/util'
import { UserContext } from '../hooks/context'
import { reducer } from '../hooks/reducer'
import styles from '../styles/main-page.module.scss'
import dynamic from 'next/dynamic'

const Classification = dynamic(() => import('../components/tabs/aiTask/classification'), { ssr: false })
const Segmentation = dynamic(() => import('../components/tabs/aiTask/segmentation'), { ssr: false })

function Home () {
  const [aiTask, setAiTask] = useState<AiTaskTabType>(AiTaskTab[0])
  const [mode, setMode] = useState<ModeTabType>(ModeTab[0])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loadingDialogFlg, setLoadingDialogFlg] = useState<boolean>(false)
  const [deviceIds, setDeviceIds] = useState<DeviceIds>({ select: '', list: {} })
  const [odData, setOdData] = useState<OdData>({
    timestamp: '',
    image: '',
    inference: undefined,
    inferenceRawData: undefined,
    labelData: ['id0', 'id1', 'id2', 'id3', 'id4']
  })
  const [clsData, setClsData] = useState<ClsData>({
    timestamp: '',
    image: '',
    inference: undefined,
    inferenceRawData: undefined,
    labelData: ['id0', 'id1', 'id2', 'id3', 'id4']
  })
  const [segData, setSegData] = useState<SegData>({
    timestamp: '',
    image: '',
    inference: undefined,
    inferenceRawData: undefined,
    labelData: [
      { isVisible: true, label: 'label1', color: '#000000' },
      { isVisible: false, label: 'label2', color: '#0000ff' },
      { isVisible: true, label: 'label3', color: '#ff0000' }]
  })
  const [displaySetting, setDisplaySetting] = useState<DisplaySetting>({
    probability: 0,
    isDisplayTs: true,
    displayScore: 5,
    isOverlayIR: true,
    overlayIRC: '#FFFFFF',
    transparency: 50
  })
  const [pollingData, setPollingData] = useState<PollingData | undefined>(undefined)
  const [abortContoroller, setAbortContoroller] = useState<AbortController>(new AbortController())
  const [state, dispatch] = useReducer(reducer, {
    isPlaying: false,
    isUploading: false,
    imageCount: 0,
    totalCount: 1,
    isFirst: true,
    displayCount: -1,
    intervalTimeValue: DEFAULT_INTERVAL_SEC,
    imagePath: ''
  })

  const pollingHandlerProps: PollingHandlerProps = {
    deviceId: deviceIds.select,
    aiTask,
    mode,
    setIsLoading,
    setLoadingDialogFlg,
    state,
    dispatch
  }

  useInterval(async () => {
    setAbortContoroller(new AbortController())
  }, state.isPlaying ? state.intervalTimeValue * 1000 : null)

  useEffect(() => {
    if (state.isPlaying) {
      setData({
        pollingData,
        aiTask,
        odData,
        setOdData,
        clsData,
        setClsData,
        segData,
        setSegData,
        setLoadingDialogFlg,
        dispatch,
        isPlaying: state.isPlaying
      })
    }
  }, [pollingData])

  useEffect(() => {
    (async () => {
      if (state.isPlaying) {
        const pollingData = await pollingHandler(pollingHandlerProps, abortContoroller)
        setPollingData(pollingData)
      }
    })()
  }, [abortContoroller])

  useEffect(() => {
    (async () => {
      if (state.isPlaying) {
        setAbortContoroller(new AbortController())
      } else {
        abortContoroller.abort('STOP')
        if (mode === HISTORY_MODE) {
          setLoadingDialogFlg(false)
        }
      }
    })()
  }, [state.isPlaying])

  useEffect(() => {
    (async () => {
      if (mode === REALTIME_MODE || mode === HISTORY_MODE) {
        if (Object.keys(deviceIds.list).length === 0) {
          await updateDeviceIdList({ setDeviceIds, setLoadingDialogFlg })
        }
      }
    })()
  }, [mode])

  return (
    <UserContext.Provider value={{ aiTask, mode, setIsLoading, setLoadingDialogFlg }}>
      <LoadingDialog display={loadingDialogFlg} />
      <Layout title="Edge Device Visualization">
        <div className={styles['main-page-container']}>
          <div className={styles['main-page-stage']}>
            <Tabs isFitted className={styles['aitask-tabs']} onChange={(taskNum) => { setAiTask(AiTaskTab[taskNum]) }}>
              <TabList className={styles['aitask-tablist']}>
                {AiTaskTab.map((value) => (
                  <Tab isDisabled={state.isPlaying || state.isUploading} key={value}>{value}</Tab>
                ))}
              </TabList>
              <div className={styles['display-setting-button']}>
                <SettingMenu
                  displaySetting={displaySetting}
                  setDisplaySetting={setDisplaySetting}
                />
              </div>
              <TabPanels>
                <TabPanel className={styles['aitask-tab-panel']}>
                  <ObjectDetection
                    data={odData}
                    setData={setOdData}
                    displaySetting={displaySetting}
                    dispatch={dispatch}
                  />
                </TabPanel>
                <TabPanel className={styles['aitask-tab-panel']}>
                  <Classification
                    data={clsData}
                    setData={setClsData}
                    displaySetting={displaySetting}
                    dispatch={dispatch}
                  />
                </TabPanel>
                <TabPanel className={styles['aitask-tab-panel']}>
                  <Segmentation
                    data={segData}
                    setData={setSegData}
                    displaySetting={displaySetting}
                    dispatch={dispatch}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
            <Tabs isFitted className={styles['mode-tabs']} onChange={(tabNum: number) => { setMode(ModeTab[tabNum]) }}>
              <TabList className={styles['mode-tablist']}>
                {ModeTab.map((value) => (
                  <Tab isDisabled={state.isPlaying || state.isUploading} key={value}>{value}</Tab>
                ))}
              </TabList>
              <div className={styles['deviceid-area']}>
                Device Name
                <DropDownList
                  id={'device-id-list'}
                  name={deviceIds.select} className={state.isPlaying || state.isUploading ? styles.disabled : styles.select}
                  list={Object.keys(deviceIds.list)}
                  onChange={(event) => {
                    setDeviceIds((prevState) => ({
                      ...prevState, select: deviceIds.list[event.target.value]
                    }))
                  }}
                  disabled={mode === REALTIME_MODE
                    ? (state.isUploading)
                    : (state.isPlaying)
                  }
                  defaultSpace={true}
                />
                <DefaultButton isLoading={false}
                  icon={<ReloadSVG />}
                  text={'Reload'}
                  disabled={mode === REALTIME_MODE
                    ? (state.isUploading)
                    : (state.isPlaying)
                  }
                  action={async () => {
                    await updateDeviceIdList({ setDeviceIds, setLoadingDialogFlg })
                  }
                  }
                />
              </div>
              <TabPanels>
                <TabPanel className={styles['realtime-mode-block']}>
                  <Realtime
                    deviceId={deviceIds.select}
                    state={state}
                    dispatch={dispatch}
                    isLoading={isLoading}
                  />
                </TabPanel>
                <TabPanel className={styles['history-mode-block']}>
                  <History
                    deviceId={deviceIds.select}
                    labelDataOD={odData.labelData}
                    labelDataCLS={clsData.labelData}
                    labelDataSEG={segData.labelData}
                    displaySetting={displaySetting}
                    state={state}
                    dispatch={dispatch}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
      </Layout >
    </UserContext.Provider>
  )
}

export default Home
